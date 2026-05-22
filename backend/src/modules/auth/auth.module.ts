import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [DbModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
