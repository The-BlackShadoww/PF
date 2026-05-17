import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export const DB_TOKEN = Symbol('DB_TOKEN');

export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;
