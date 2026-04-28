import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterTeacherDto {
  @ApiProperty({ example: 'teacher@school.edu' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Springfield Elementary' })
  @IsString()
  school_name!: string;

  @ApiProperty({ example: 'SG', required: false })
  @IsOptional()
  @IsString()
  school_country?: string;
}
