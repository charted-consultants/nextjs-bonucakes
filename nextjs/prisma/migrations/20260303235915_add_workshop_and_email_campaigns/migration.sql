-- CreateTable
CREATE TABLE "workshop_registrations" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER,
    "workshop_name" TEXT NOT NULL,
    "workshop_date" TIMESTAMP(3),
    "registration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "age" TEXT,
    "location" TEXT,
    "phone" TEXT,
    "facebook_link" TEXT,
    "fb_experience" TEXT,
    "barriers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "goals" TEXT,
    "specific_questions" TEXT,
    "availability" TEXT,
    "referral_source" TEXT,
    "other_notes" TEXT,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "attendance_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workshop_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER,
    "event_id" INTEGER NOT NULL,
    "registration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticket_type" TEXT,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "attendance_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_campaigns" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html_template" TEXT NOT NULL,
    "filters" JSONB,
    "total_recipients" INTEGER NOT NULL DEFAULT 0,
    "sent_at" TIMESTAMP(3),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_campaign_recipients" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "clicked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "email_campaign_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workshop_registrations_customer_id_idx" ON "workshop_registrations"("customer_id");

-- CreateIndex
CREATE INDEX "workshop_registrations_workshop_name_idx" ON "workshop_registrations"("workshop_name");

-- CreateIndex
CREATE INDEX "workshop_registrations_workshop_date_idx" ON "workshop_registrations"("workshop_date");

-- CreateIndex
CREATE INDEX "workshop_registrations_attended_idx" ON "workshop_registrations"("attended");

-- CreateIndex
CREATE INDEX "event_registrations_customer_id_idx" ON "event_registrations"("customer_id");

-- CreateIndex
CREATE INDEX "event_registrations_event_id_idx" ON "event_registrations"("event_id");

-- CreateIndex
CREATE INDEX "event_registrations_attended_idx" ON "event_registrations"("attended");

-- CreateIndex
CREATE INDEX "email_campaigns_category_idx" ON "email_campaigns"("category");

-- CreateIndex
CREATE INDEX "email_campaigns_sent_at_idx" ON "email_campaigns"("sent_at");

-- CreateIndex
CREATE INDEX "email_campaign_recipients_campaign_id_idx" ON "email_campaign_recipients"("campaign_id");

-- CreateIndex
CREATE INDEX "email_campaign_recipients_customer_id_idx" ON "email_campaign_recipients"("customer_id");

-- CreateIndex
CREATE INDEX "email_campaign_recipients_opened_idx" ON "email_campaign_recipients"("opened");

-- CreateIndex
CREATE INDEX "email_campaign_recipients_clicked_idx" ON "email_campaign_recipients"("clicked");

-- AddForeignKey
ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_campaign_recipients" ADD CONSTRAINT "email_campaign_recipients_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "email_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_campaign_recipients" ADD CONSTRAINT "email_campaign_recipients_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
