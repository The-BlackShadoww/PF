-- Migration: Add transaction_month and transaction_year billing period columns
-- These replace the `date` column as the source of truth for period grouping.
-- The `date` column is retained as the physical handover date (informational).
-- Existing data is backfilled from the UTC month/year of the existing date column.
ALTER TABLE "transactions" ADD COLUMN "transaction_month" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "transaction_year" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
-- Backfill transaction_month and transaction_year from the existing date column.
-- We extract month and year from the stored UTC timestamp.
-- This preserves existing data — no transactions are lost or changed.
-- After backfill, the value 0 will never appear in production data.
UPDATE "transactions"
SET
  "transaction_month" = EXTRACT(MONTH FROM "date")::integer,
  "transaction_year" = EXTRACT(YEAR FROM "date")::integer
WHERE "transaction_month" = 0 OR "transaction_year" = 0;--> statement-breakpoint
-- Verify the backfill worked — this will error if any rows still have 0
-- (acts as a migration safety check):
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "transactions"
    WHERE "transaction_month" = 0 OR "transaction_year" = 0
  ) THEN
    RAISE EXCEPTION 'Backfill failed: some transactions still have period 0';
  END IF;
END $$;--> statement-breakpoint
CREATE INDEX "transactions_period_idx" ON "transactions" USING btree ("transaction_month","transaction_year");--> statement-breakpoint
CREATE INDEX "transactions_user_period_idx" ON "transactions" USING btree ("user_id","transaction_year","transaction_month");--> statement-breakpoint
