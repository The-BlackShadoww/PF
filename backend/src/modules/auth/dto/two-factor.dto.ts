import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString, Length, Matches } from 'class-validator';

// Used by POST /auth/2fa/enable
export class EnableTwoFactorDto {
  @ApiProperty({
    description: 'The 6-digit TOTP code from your authenticator app',
    example: '123456',
    minLength: 6,
    maxLength: 6,
    pattern: '^\\d{6}$',
  })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'code must be exactly 6 digits' })
  code!: string;
}

// Used by POST /auth/2fa/verify (during login)
export class VerifyTwoFactorDto {
  @ApiProperty({
    description: 'The tempToken received from POST /auth/login when 2FA is required',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsJWT()
  tempToken!: string;

  @ApiProperty({
    description: 'The 6-digit TOTP code from your authenticator app',
    example: '123456',
  })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'code must be exactly 6 digits' })
  code!: string;
}

// Used by POST /auth/2fa/disable
export class DisableTwoFactorDto {
  @ApiProperty({
    description: 'Your current 6-digit TOTP code, required to confirm disabling 2FA',
    example: '654321',
  })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'code must be exactly 6 digits' })
  code!: string;
}
