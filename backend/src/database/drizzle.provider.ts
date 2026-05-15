import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';
import { DATABASE_CONNECTION } from './constants';

export const drizzleProvider: Provider = {
  provide: DATABASE_CONNECTION,
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const url = config.getOrThrow<string>('DATABASE_URL');
    const client = postgres(url);
    const db = drizzle(client, { schema });

    try {
      await migrate(db, { migrationsFolder: './drizzle/migrations' });
    } catch (error) {
      console.error('Failed to run database migrations on startup', error);
      throw error;
    }

    return db;
  },
};
