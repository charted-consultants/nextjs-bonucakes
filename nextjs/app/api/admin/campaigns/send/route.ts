import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/admin/campaigns/send - Send email campaign
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, templateId, subject, filters, customerIds } = body;

    // Validate required fields
    if (!name || !templateId || !customerIds || customerIds.length === 0) {
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

    // Send emails and create recipient records
    const sendPromises = customers.map(async (customer) => {
      try {
        // Replace placeholders in HTML
        const personalizedHtml = template.htmlContent
          .replace(/{name}/g, customer.name)
          .replace(/{email}/g, customer.email);

        // Send email via Resend
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@bonucakes.com',
          to: customer.email,
          subject: subject || template.subject,
          html: personalizedHtml,
        });

        // Create recipient record
        await prisma.emailCampaignRecipient.create({
          data: {
            campaignId: campaign.id,
            customerId: customer.id,
            sentAt: new Date(),
          },
        });

        return { success: true, email: customer.email };
      } catch (error) {
        console.error(`Failed to send to ${customer.email}:`, error);
        return { success: false, email: customer.email, error };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
      },
      sent: successCount,
      failed: failedCount,
      total: customers.length,
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
