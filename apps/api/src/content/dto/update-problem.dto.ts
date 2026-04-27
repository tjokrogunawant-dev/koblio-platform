import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Difficulty, ProblemType } from '@prisma/client';

export class UpdateProblemDto {
  @ApiPropertyOptional({ example: 2, minimum: 1, maximum: 6 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  grade?: number;

  @ApiPropertyOptional({ example: 'operations-and-algebraic-thinking' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  strand?: string;

  @ApiPropertyOptional({ example: 'addition' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  topic?: string;

  @ApiPropertyOptional({ enum: Difficulty })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional({ enum: ProblemType })
  @IsOptional()
  @IsEnum(ProblemType)
  type?: ProblemType;

  @ApiPropertyOptional({
    description: 'Raw JSONB content — must include question, answer, solution',
  })
  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;
}
