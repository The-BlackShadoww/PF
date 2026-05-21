import { relations } from 'drizzle-orm/relations';
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const transactionTypeEnum = pgEnum('transaction_type', [
  'income',
  'expense',
]);

export const categoryTypeEnum = pgEnum('category_type', ['income', 'expense']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    avatarUrl: text('avatar_url'),
    passwordHash: text('password_hash'),
    googleId: varchar('google_id', { length: 255 }),
    twoFactorSecret: text('two_factor_secret'),
    twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
    timezone: varchar('timezone', { length: 100 }).notNull().default('UTC'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('users_email_idx').on(table.email),
    index('users_google_id_idx').on(table.googleId),
  ],
);

// Forward declarations — uncomment when tables are added:
// export const transactions = ...
// export const categories = ...
// export const budgets = ...

export const usersRelations = relations(users, () => ({
  // transactions: many(transactions),
  // categories: many(categories),
  // budgets: many(budgets),
}));
