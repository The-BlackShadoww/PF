import { Global, Module, type Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DB_TOKEN } from './db.constants';
import * as schema from './schema';

const dbProvider: Provider = {
  provide: DB_TOKEN,
  useFactory: (config: ConfigService) => {
    const url = config.getOrThrow<string>('DATABASE_URL');
    const client = postgres(url);
    return drizzle(client, { schema });
  },
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [dbProvider],
  exports: [DB_TOKEN],
})
export class DbModule {}
