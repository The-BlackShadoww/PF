import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
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
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
