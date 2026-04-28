import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsObject, IsString, Max, Min } from 'class-validator';
import { Difficulty, ProblemType } from '@prisma/client';

export class CreateProblemDto {
  @ApiProperty({ example: 2, minimum: 1, maximum: 6 })
  @IsInt()
  @Min(1)
  @Max(6)
  grade!: number;

  @ApiProperty({ example: 'operations-and-algebraic-thinking' })
  @IsString()
  @IsNotEmpty()
  strand!: string;

  @ApiProperty({ example: 'addition' })
  @IsString()
  @IsNotEmpty()
  topic!: string;

  @ApiProperty({ enum: Difficulty, example: Difficulty.EASY })
  @IsEnum(Difficulty)
  difficulty!: Difficulty;

  @ApiProperty({ enum: ProblemType, example: ProblemType.MCQ })
  @IsEnum(ProblemType)
  type!: ProblemType;

  @ApiProperty({
    description: 'Raw JSONB content — must include question, answer, solution',
    example: { question: 'What is 2+2?', answer: '4', solution: 'Count on from 2.' },
  })
  @IsObject()
  content!: Record<string, unknown>;
}
