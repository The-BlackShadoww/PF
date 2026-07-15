import { IsNotEmpty, IsString, Length } from 'class-validator';

export class Enable2FaDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code!: string;
}

export class Verify2FaDto {
  @IsString()
  @IsNotEmpty()
  tempToken!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code!: string;
}

export class Disable2FaDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code!: string;
}
