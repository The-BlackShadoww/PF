import { IsString, Length, Matches, IsJWT } from 'class-validator';

// Used by POST /auth/2fa/enable
export class EnableTwoFactorDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'code must be exactly 6 digits' })
  code!: string;
}

// Used by POST /auth/2fa/verify (during login)
export class VerifyTwoFactorDto {
  @IsJWT()
  tempToken!: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'code must be exactly 6 digits' })
  code!: string;
}

// Used by POST /auth/2fa/disable
export class DisableTwoFactorDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'code must be exactly 6 digits' })
  code!: string;
}
