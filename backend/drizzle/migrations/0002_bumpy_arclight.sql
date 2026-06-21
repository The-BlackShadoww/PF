DROP INDEX "refresh_tokens_token_hash_idx";--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD COLUMN "token_family" uuid;--> statement-breakpoint
UPDATE "refresh_tokens" SET "token_family" = gen_random_uuid() WHERE "token_family" IS NULL;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "token_family" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "refresh_tokens_token_family_idx" ON "refresh_tokens" USING btree ("token_family");
