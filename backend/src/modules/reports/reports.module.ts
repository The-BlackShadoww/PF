import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TransactionsModule } from '../transactions/transactions.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          limit: 10,
          ttl: 3600,
          getTracker: (request) => request.user?.id ?? request.ip,
        },
      ],
    }),
    TransactionsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
