import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class StudentLoginDto {
  @ApiProperty({ example: 'bobby1234' })
  @IsString()
  @MaxLength(50)
  username!: string;

  @ApiProperty({ minLength: 6, maxLength: 72 })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password!: string;
}
