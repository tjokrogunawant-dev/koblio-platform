import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsString,
} from 'class-validator';

export enum LoginKind {
  EMAIL = 'email',
  STUDENT = 'student',
  CLASS_CODE = 'class_code',
}

export class EmailLoginDto {
  @ApiProperty({ enum: ['email'] })
  @IsEnum(LoginKind)
  kind!: LoginKind.EMAIL;

  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  password!: string;
}

export class StudentLoginDto {
  @ApiProperty({ enum: ['student'] })
  @IsEnum(LoginKind)
  kind!: LoginKind.STUDENT;

  @ApiProperty({ example: 'alice_p3' })
  @IsString()
  username!: string;

  @ApiProperty()
  @IsString()
  password!: string;
}

export class ClassCodeLoginDto {
  @ApiProperty({ enum: ['class_code'] })
  @IsEnum(LoginKind)
  kind!: LoginKind.CLASS_CODE;

  @ApiProperty({ example: 'SUN-DRAGON-42' })
  @IsString()
  class_code!: string;

  @ApiProperty({
    type: [String],
    minItems: 3,
    maxItems: 4,
    description: 'Picture password selections for K-2 students',
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(3)
  @ArrayMaxSize(4)
  picture_password!: string[];
}

export class ClassCodeLookupDto {
  @ApiProperty({ example: 'SUN-DRAGON-42' })
  @IsString()
  class_code!: string;
}
