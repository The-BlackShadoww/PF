import { sql, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  numeric,
  integer,
  timestamp,
  check,
  index,
} from 'drizzle-orm/pg-core';

export const events = pgTable(
  'events',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    isFree: boolean('is_free').notNull().default(true),
    ticketPrice: numeric('ticket_price', { precision: 10, scale: 2 }),
    capacity: integer('capacity').default(1),
    requiresApproval: boolean('requires_approval').notNull().default(false),
    isPublic: boolean('is_public').notNull().default(true),
    locationType: varchar('location_type', { length: 10 }).notNull(),
    locationValue: text('location_value').notNull(),
    coverImageUrl: text('cover_image_url'),
    scheduledAt: timestamp('scheduled_at', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
    endedAt: timestamp('ended_at', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
    status: varchar('status', { length: 50 }).notNull().default('PENDING'),
    bullJobId: varchar('bull_job_id', { length: 255 }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      'status_check',
      sql`${table.status} IN ('PENDING', 'ACTIVE', 'CANCELLED_SCHEDULE', 'CANCELLED', 'COMPLETED')`,
    ),
    check(
      'location_type_check',
      sql`${table.locationType} IN ('PHYSICAL', 'ONLINE')`,
    ),
    index('status_idx').on(table.status),
    index('scheduled_at_idx').on(table.scheduledAt),
    index('status_scheduled_at_idx').on(table.status, table.scheduledAt),
  ],
);

export type Event = InferSelectModel<typeof events>;
export type CreateEvent = InferInsertModel<typeof events>;
