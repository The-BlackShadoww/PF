import { Global, Module } from '@nestjs/common';
import { drizzleProvider } from './drizzle.provider';
import { DATABASE_CONNECTION } from './constants';

@Global()
@Module({
  providers: [drizzleProvider],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
