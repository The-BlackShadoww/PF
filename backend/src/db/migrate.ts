import path from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function runMigrations(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  const migrationsFolder = path.join(__dirname, '../../drizzle/migrations');

  try {
    await migrate(db, { migrationsFolder });
  } finally {
    await client.end();
  }
}

runMigrations()
  .then(() => {
    console.log('Migrations applied successfully');
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error('Migration failed', error);
    process.exit(1);
  });
