# Workshop Registration & Email Campaign System Implementation

## Overview

This document describes the implementation of the workshop registration system, email campaign tracking, and customer auto-tagging features for the Bonucakes platform.

## Database Schema Changes

### New Tables Created

#### 1. `workshop_registrations`
Stores workshop registration data from Google Forms and other sources.

**Fields:**
- `id` - Primary key
- `customer_id` - Foreign key to customers table
- `workshop_name` - Name of the workshop
- `workshop_date` - Date of the workshop
- `registration_date` - When they registered
- `age` - Birth year/age information
- `location` - Geographic location (UK, Vietnam, Australia, etc.)
- `phone` - Contact phone number
- `facebook_link` - Facebook profile link
- `fb_experience` - Facebook business experience level
- `barriers` - Array of barriers preventing them from starting
- `goals` - Their goals for attending
- `specific_questions` - Questions for the instructor
- `availability` - Time preferences
- `referral_source` - How they heard about the workshop
- `other_notes` - Additional notes
- `attended` - Boolean flag for attendance
- `attendance_date` - When they attended
- `created_at` - Record creation timestamp

#### 2. `event_registrations`
Links customers to events for better tracking than the existing `registrationUrl` approach.

**Fields:**
- `id` - Primary key
- `customer_id` - Foreign key to customers table
- `event_id` - Foreign key to events table
- `registration_date` - When they registered
- `ticket_type` - Type of ticket (if applicable)
- `attended` - Boolean flag for attendance
- `attendance_date` - When they attended
- `created_at` - Record creation timestamp

#### 3. `email_campaigns`
Tracks email campaigns sent to customers.

**Fields:**
- `id` - Primary key
- `name` - Campaign name
- `category` - Type (reminder, announcement, promotion, newsletter)
- `subject` - Email subject line
- `html_template` - HTML content of the email
- `filters` - JSON field storing filters used for targeting
- `total_recipients` - Count of recipients
- `sent_at` - When the campaign was sent
- `created_by` - Who created the campaign
- `created_at` - Record creation timestamp

#### 4. `email_campaign_recipients`
Tracks individual email deliveries and engagement.

**Fields:**
- `id` - Primary key
- `campaign_id` - Foreign key to email_campaigns table
- `customer_id` - Foreign key to customers table
- `sent_at` - When the email was sent
- `opened` - Boolean flag for email opens
- `clicked` - Boolean flag for link clicks

### Updated Tables

#### `customers`
Added relations to new tables:
- `workshopRegistrations` - One-to-many relation
- `eventRegistrations` - One-to-many relation
- `emailCampaignRecipients` - One-to-many relation

#### `events`
Added relation:
- `eventRegistrations` - One-to-many relation

## Auto-Tagging System

### Auto-Tagging Logic (`lib/auto-tagging.ts`)

#### Order-Based Tags
Automatically applied based on purchase history:

- `food_customer` - Has placed at least one order
- `repeat_buyer` - Has placed more than 1 order
- `frequent_buyer` - Has placed 5+ orders
- `loyal_customer` - Has placed 10+ orders
- `high_value` - Total spent > £100
- `vip_spender` - Total spent > £250
- `premium_customer` - Total spent > £500

#### Workshop-Based Tags
Applied when someone registers for a workshop:

**Workshop Type:**
- `workshop_participant` - Attended any workshop
- `workshop_goal_setting` - Attended goal-setting workshop
- `workshop_f&b` - Attended F&B business workshop

**Location:**
- `uk_based` - Located in UK
- `vietnam_based` - Located in Vietnam
- `australia_based` - Located in Australia
- `france_based` - Located in France

**Experience Level:**
- `fb_beginner` - No Facebook business experience
- `fb_experienced` - Has Facebook business experience

**Goals:**
- `seeking_side_income` - Looking for additional income
- `career_change` - Want to change career
- `family_business` - Family business interest

**Referral Source:**
- `referral_facebook_personal` - From Bo's personal Facebook
- `referral_facebook_group` - From Facebook group/community
- `referral_word_of_mouth` - Word of mouth referral

#### Customer Segments
Automatically calculated:

- `vip` - High value (>£250) with recent activity (<60 days)
- `regular` - Normal customers with some activity
- `inactive` - No orders in 180+ days

## Scripts

### 1. CSV Import Script (`scripts/import-workshop-csv.ts`)

Imports workshop registrations from Google Forms CSV exports.

**Usage:**
```bash
tsx scripts/import-workshop-csv.ts path/to/workshop-data.csv
```

**Features:**
- Creates or updates customer records
- Auto-applies workshop-based tags
- Sets marketing consent
- Handles duplicate registrations
- Provides detailed import summary

**Example:**
```bash
tsx scripts/import-workshop-csv.ts ".resources/workshop-march-2026.csv"
```

### 2. Enhanced Order Sync Script (`scripts/sync-customer-orders.ts`)

Updated to include auto-tagging logic.

**Usage:**
```bash
tsx scripts/sync-customer-orders.ts
```

**Features:**
- Syncs order data with customer records
- Auto-applies order-based tags
- Calculates customer segments
- Updates totalOrders, totalSpent, lastOrderDate
- Merges tags (doesn't override existing tags)

## API Routes

### Workshop Management

#### `GET /api/admin/workshops`
List all workshop registrations with filtering.

**Query Parameters:**
- `workshopName` - Filter by workshop name
- `attended` - Filter by attendance (true/false)
- `location` - Filter by location
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50)

**Response:**
```json
{
  "registrations": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "totalPages": 1
  }
}
```

#### `POST /api/admin/workshops`
Create a new workshop registration.

**Request Body:**
```json
{
  "email": "customer@example.com",
  "name": "Customer Name",
  "workshopName": "Goal Setting Workshop",
  "workshopDate": "2026-03-04",
  "age": "1985",
  "location": "UK",
  "phone": "07123456789",
  "goals": "Looking to start a side business",
  ...
}
```

#### `GET /api/admin/workshops/:id`
Get a single workshop registration with customer data.

#### `PATCH /api/admin/workshops/:id`
Update a workshop registration.

**Common Use Case - Mark as Attended:**
```json
{
  "attended": true
}
```

#### `DELETE /api/admin/workshops/:id`
Delete a workshop registration.

## Deployment

The system deploys automatically via GitHub Actions when you push to the `main` branch.

**Deployment Process:**
1. Push code to GitHub
2. GitHub Actions builds Docker image with updated schema
3. Copies image to VPS
4. Runs `prisma migrate deploy` automatically
5. Restarts production and staging containers

**Manual Staging Deployment (if needed):**
```bash
ssh root@178.128.41.146
cd /root/docker-images/bonucakes-staging
./deploy-bonucakes-staging.sh
```

## Migration Files

Migrations are managed by Prisma. When the schema changes:

1. Locally: `npx prisma migrate dev --name description_of_change`
2. In Production: Automatic via deployment script

**Production Migration Command:**
```bash
docker compose run --rm app npx prisma migrate deploy
```

## Usage Examples

### Import Workshop Registrations

```bash
# Copy CSV to server
scp workshop-data.csv root@178.128.41.146:/root/bonucakes/nextjs/

# SSH into production container
ssh root@178.128.41.146
docker exec -it nextjs_bonucakes bash

# Run import
tsx scripts/import-workshop-csv.ts /data/workshop-data.csv
```

### Sync Customer Tags

```bash
# Run order sync to update all customer tags and segments
docker exec -it nextjs_bonucakes bash
tsx scripts/sync-customer-orders.ts
```

### Query Workshop Participants

```typescript
// Get all workshop participants
const participants = await prisma.customer.findMany({
  where: {
    tags: {
      has: 'workshop_participant'
    }
  },
  include: {
    workshopRegistrations: true
  }
});

// Get UK-based participants who want side income
const targeted = await prisma.customer.findMany({
  where: {
    AND: [
      { tags: { has: 'uk_based' } },
      { tags: { has: 'seeking_side_income' } },
      { marketingConsent: true }
    ]
  }
});
```

## Next Steps

### Recommended Enhancements

1. **Email Campaign UI** - Admin interface to create and send campaigns
2. **Tag Management UI** - View and manually edit customer tags
3. **Segment Analytics** - Dashboard showing segment distributions
4. **Automated Email Sequences** - Drip campaigns for workshop attendees
5. **Attendance Tracking** - QR code check-in system
6. **Workshop Feedback** - Post-workshop surveys and ratings

### Data Migration Checklist

- [ ] Import existing workshop CSV data
- [ ] Run order sync to tag existing customers
- [ ] Verify customer segments are correct
- [ ] Test API endpoints in staging
- [ ] Create first email campaign
- [ ] Monitor database performance

## Troubleshooting

### Migration Issues

If migrations fail:
```bash
# Check migration status
docker exec nextjs_bonucakes npx prisma migrate status

# Reset (CAUTION: Development only)
docker exec nextjs_bonucakes npx prisma migrate reset

# Apply specific migration
docker exec nextjs_bonucakes npx prisma migrate deploy
```

### Tag Issues

If tags aren't being applied:
```bash
# Re-run the sync script
docker exec nextjs_bonucakes tsx scripts/sync-customer-orders.ts

# Check customer tags in database
docker exec bonucakes_postgres psql -U bonucakes_user -d bonucakes_db -c "SELECT email, tags FROM customers WHERE 'workshop_participant' = ANY(tags);"
```

## Technical Notes

- Tags are stored as PostgreSQL arrays (`text[]`)
- Auto-tagging merges new tags with existing ones (no overwrite)
- Workshop date is optional to support future workshops
- Customer consent is automatically set to true for workshop participants
- All timestamps are stored in UTC

## Support

For questions or issues:
1. Check the logs: `docker logs nextjs_bonucakes`
2. Check database connectivity: `docker exec nextjs_bonucakes npx prisma db pull`
3. Review migration history: `docker exec nextjs_bonucakes npx prisma migrate status`
