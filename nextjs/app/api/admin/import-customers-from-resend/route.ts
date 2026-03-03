import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface ResendEmail {
  id: string
  to: string[]
  from: string
  subject: string
  created_at: string
  last_event: string
}

interface ResendResponse {
  object: string
  has_more: boolean
  data: ResendEmail[]
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY not configured" },
        { status: 500 }
      )
    }

    const importedEmails = new Map<string, { name: string; firstSeen: Date }>()
    let hasMore = true
    let allEmails: ResendEmail[] = []

    // Fetch all emails from Resend (paginated)
    console.log("Fetching emails from Resend API...")

    while (hasMore && allEmails.length < 1000) { // Safety limit
      const response = await fetch(
        `https://api.resend.com/emails?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Resend API error: ${response.statusText}`)
      }

      const data: ResendResponse = await response.json()
      allEmails = allEmails.concat(data.data)
      hasMore = data.has_more

      // For now, just get first batch to avoid rate limits
      break
    }

    console.log(`Fetched ${allEmails.length} emails from Resend`)

    // Filter for Bonu-related emails only
    const bonuEmails = allEmails.filter(email =>
      email.from.toLowerCase().includes('bonu') ||
      email.subject.toLowerCase().includes('bonu')
    )

    console.log(`Found ${bonuEmails.length} Bonu-related emails`)

    // Extract unique email addresses
    bonuEmails.forEach(email => {
      email.to.forEach(recipient => {
        const emailLower = recipient.toLowerCase()

        // Skip admin/system emails
        if (
          emailLower.includes('bonucakes@gmail.com') ||
          emailLower.includes('noreply') ||
          emailLower.includes('no-reply')
        ) {
          return
        }

        const createdAt = new Date(email.created_at)

        if (!importedEmails.has(emailLower)) {
          // Extract name from email (rough guess)
          const namePart = emailLower.split('@')[0]
          const name = namePart
            .split(/[._-]/)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ')

          importedEmails.set(emailLower, {
            name: name || 'Customer',
            firstSeen: createdAt
          })
        } else {
          // Update first seen date if this email is older
          const existing = importedEmails.get(emailLower)!
          if (createdAt < existing.firstSeen) {
            existing.firstSeen = createdAt
          }
        }
      })
    })

    console.log(`Found ${importedEmails.size} unique customer emails`)

    // Import customers into database
    let created = 0
    let skipped = 0
    const errors: string[] = []

    for (const [email, data] of importedEmails) {
      try {
        // Check if customer already exists
        const existing = await prisma.customer.findUnique({
          where: { email }
        })

        if (existing) {
          skipped++
          continue
        }

        // Create new customer with marketing consent (since they received emails before)
        await prisma.customer.create({
          data: {
            email,
            name: data.name,
            marketingConsent: true, // They received emails, so implicit consent
            consentedAt: data.firstSeen,
            consentSource: "resend_import", // Track that this was imported from Resend
            notes: `Imported from Resend API on ${new Date().toISOString()}. First email sent: ${data.firstSeen.toISOString()}`,
          }
        })

        created++
      } catch (error: any) {
        console.error(`Failed to import ${email}:`, error)
        errors.push(`${email}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      totalEmailsFetched: allEmails.length,
      bonuEmailsFound: bonuEmails.length,
      uniqueCustomers: importedEmails.size,
      created,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Error importing customers from Resend:", error)
    return NextResponse.json(
      { error: "Failed to import customers" },
      { status: 500 }
    )
  }
}
