import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class JoinClassDto {
  @ApiProperty({ example: 'ABC123' })
  @IsString()
  @Length(6, 20)
  class_code!: string;
}
