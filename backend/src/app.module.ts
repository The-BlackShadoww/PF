import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';

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
    DatabaseModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
