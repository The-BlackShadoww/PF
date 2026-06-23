import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import configuration from './config/configuration';
import { DbModule } from './db/db.module';
import { AuthModule } from './modules/auth/auth.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { CalculationsModule } from './modules/calculations/calculations.module';
import { TransactionsModule } from './modules/transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        FRONTEND_URL: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().optional(),
        GOOGLE_CLIENT_SECRET: Joi.string().optional(),
        REDIS_URL: Joi.string().optional(),
        PORT: Joi.number().optional(),
      }),
    }),
    DbModule,
    AuthModule,
    CalculationsModule,
    BudgetsModule,
    TransactionsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
