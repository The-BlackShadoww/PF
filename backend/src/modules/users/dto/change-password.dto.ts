import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The user\'s current password for verification',
    example: 'OldSecurePass123!',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'The new password. Minimum 8 characters, maximum 72.',
    example: 'NewSecurePass456!',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword: string;
}
