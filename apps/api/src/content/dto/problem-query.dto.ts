import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProblemQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  @Type(() => Number)
  grade?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  strand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({ enum: ['EASY', 'MEDIUM', 'HARD'] })
  @IsOptional()
  @IsEnum(['EASY', 'MEDIUM', 'HARD'])
  difficulty?: string;

  @ApiPropertyOptional({ enum: ['MCQ', 'FILL_BLANK', 'TRUE_FALSE'] })
  @IsOptional()
  @IsEnum(['MCQ', 'FILL_BLANK', 'TRUE_FALSE'])
  type?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}
