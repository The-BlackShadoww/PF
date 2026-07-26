import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: "The user's full name",
    example: 'Ashikur Rahman',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: "The user's email address. Must be unique.",
    example: 'ashikur@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Password. Minimum 8 characters, maximum 72 (bcrypt limit).',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
