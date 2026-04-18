import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterParentDto {
  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Alice Zhang' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'SG' })
  @IsString()
  country!: string;

  @ApiProperty({ example: 'en-SG', required: false })
  @IsOptional()
  @IsString()
  locale?: string;
}
