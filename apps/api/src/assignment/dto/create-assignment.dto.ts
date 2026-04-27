import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Difficulty } from '@prisma/client';

export class CreateAssignmentDto {
  @ApiProperty({ example: 'uuid-of-classroom' })
  @IsUUID()
  classroomId!: string;

  @ApiProperty({ example: 'Week 3 Addition Practice' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'addition' })
  @IsString()
  topic!: string;

  @ApiProperty({ example: 'operations-and-algebraic-thinking' })
  @IsString()
  strand!: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 6 })
  @IsInt()
  @Min(1)
  @Max(6)
  grade!: number;

  @ApiProperty({ enum: Difficulty, example: Difficulty.EASY })
  @IsEnum(Difficulty)
  difficulty!: Difficulty;

  @ApiProperty({
    description: 'List of problem UUIDs to assign (1–10)',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsUUID('4', { each: true })
  problemIds!: string[];

  @ApiProperty({ required: false, description: 'ISO 8601 due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
