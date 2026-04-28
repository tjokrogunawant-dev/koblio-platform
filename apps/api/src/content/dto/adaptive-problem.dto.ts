import { IsInt, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AdaptiveProblemDto {
  @ApiProperty({ description: 'Student UUID', format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'Grade level (1–6)', minimum: 1, maximum: 6 })
  @IsInt()
  @Min(1)
  @Max(6)
  @Type(() => Number)
  grade!: number;

  @ApiProperty({ description: 'Topic identifier (e.g. "fractions")' })
  @IsString()
  topic!: string;
}
