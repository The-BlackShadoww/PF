CREATE TABLE "account_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"initial_balance_cents" integer DEFAULT 0 NOT NULL,
	"low_balance_threshold_cents" integer DEFAULT 500000 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_config_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "savings_sectors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"percentage" integer NOT NULL,
	"color" varchar(7) DEFAULT '#6b7280' NOT NULL,
	"icon" varchar(50) DEFAULT 'piggy-bank' NOT NULL,
	"target_amount_cents" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_config" ADD CONSTRAINT "account_config_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "savings_sectors" ADD CONSTRAINT "savings_sectors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "savings_sectors_user_id_idx" ON "savings_sectors" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "savings_sectors_user_name_idx" ON "savings_sectors" USING btree ("user_id","name");