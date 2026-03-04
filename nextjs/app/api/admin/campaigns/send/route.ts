import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

// POST /api/admin/campaigns/send - Send email campaign
// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to send emails in batches with rate limiting
async function sendEmailsInBatches(
  resend: any,
  customers: any[],
  template: any,
  subject: string,
  campaignId: number
) {
  const BATCH_SIZE = 100; // Resend allows up to 100 emails per batch
  const DELAY_BETWEEN_BATCHES = 500; // 500ms delay to respect 2 req/sec limit

  let successCount = 0;
  let failedCount = 0;
  const failedEmails: string[] = [];

  // Process in batches
  for (let i = 0; i < customers.length; i += BATCH_SIZE) {
    const batch = customers.slice(i, i + BATCH_SIZE);

    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(customers.length / BATCH_SIZE)}`);

    // Process each email in the current batch
    for (const customer of batch) {
      try {
        // Replace placeholders in HTML
        const personalizedHtml = template.htmlContent
          .replace(/{name}/g, customer.name)
          .replace(/{email}/g, customer.email);

        // Send email via Resend
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@bonucakes.com',
          to: customer.email,
          subject: subject,
          html: personalizedHtml,
        });

        // Create recipient record
        await prisma.emailCampaignRecipient.create({
          data: {
            campaignId,
            customerId: customer.id,
            sentAt: new Date(),
          },
        });

        successCount++;
      } catch (error: any) {
        console.error(`Failed to send to ${customer.email}:`, error);
        failedCount++;
        failedEmails.push(customer.email);

        // If rate limited, wait longer before continuing
        if (error.statusCode === 429) {
          console.log('Rate limited, waiting 2 seconds...');
          await delay(2000);
        }
      }
    }

    // Delay between batches to respect rate limits (except for last batch)
    if (i + BATCH_SIZE < customers.length) {
      await delay(DELAY_BETWEEN_BATCHES);
    }
  }

  return { successCount, failedCount, failedEmails };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, templateId, subject, filters, customerIds, testMode, testEmail } = body;

    // Validate required fields
    if (!name || !templateId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the email template
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Initialize Resend client at runtime
    const resend = new Resend(process.env.RESEND_API_KEY);

    // TEST MODE: Send to test email only
    if (testMode) {
      if (!testEmail) {
        return NextResponse.json(
          { error: 'Test email address is required in test mode' },
          { status: 400 }
        );
      }

      try {
        const personalizedHtml = template.htmlContent
          .replace(/{name}/g, 'Test User')
          .replace(/{email}/g, testEmail);

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@bonucakes.com',
          to: testEmail,
          subject: `[TEST] ${subject || template.subject}`,
          html: personalizedHtml,
        });

        return NextResponse.json({
          success: true,
          testMode: true,
          sent: 1,
          message: `Test email sent to ${testEmail}`,
        });
      } catch (error: any) {
        console.error('Failed to send test email:', error);
        return NextResponse.json(
          { error: 'Failed to send test email: ' + error.message },
          { status: 500 }
        );
      }
    }

    // PRODUCTION MODE: Send to filtered customers
    if (!customerIds || customerIds.length === 0) {
      return NextResponse.json(
        { error: 'No recipients specified' },
        { status: 400 }
      );
    }

    // Get customers to send to
    const customers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
        marketingConsent: true, // Double-check consent
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (customers.length === 0) {
      return NextResponse.json(
        { error: 'No eligible customers found' },
        { status: 400 }
      );
    }

    // Create campaign record
    const campaign = await prisma.emailCampaign.create({
      data: {
        name,
        category: 'marketing',
        subject: subject || template.subject,
        htmlTemplate: template.htmlContent,
        filters: filters || {},
        totalRecipients: customers.length,
        createdBy: session.user.email || undefined,
        sentAt: new Date(),
      },
    });

    // Send emails in batches with rate limiting
    const { successCount, failedCount, failedEmails } = await sendEmailsInBatches(
      resend,
      customers,
      template,
      subject || template.subject,
      campaign.id
    );

    console.log(`Campaign completed: ${successCount} sent, ${failedCount} failed`);
    if (failedEmails.length > 0) {
      console.log('Failed emails:', failedEmails);
    }

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
      },
      sent: successCount,
      failed: failedCount,
      total: customers.length,
      failedEmails: failedEmails.slice(0, 10), // Return first 10 failed emails
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
