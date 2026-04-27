import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty({ description: 'UUID of the problem being answered' })
  @IsUUID()
  problemId!: string;

  @ApiProperty({ description: 'The answer submitted by the student' })
  @IsString()
  answer!: string;

  @ApiProperty({
    description: 'Time spent on this problem in milliseconds (0–600000)',
    minimum: 0,
    maximum: 600000,
  })
  @IsInt()
  @Min(0)
  @Max(600000)
  timeSpentMs!: number;

  @ApiProperty({ required: false, description: 'Whether a hint was used' })
  @IsOptional()
  @IsBoolean()
  hintUsed?: boolean;
}
