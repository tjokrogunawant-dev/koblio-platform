import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateClassroomDto {
  @ApiProperty({ example: '3A' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 3, minimum: 1, maximum: 6 })
  @IsInt()
  @Min(1)
  @Max(6)
  grade!: number;

  @ApiProperty({ required: false, description: 'School to associate this classroom with' })
  @IsOptional()
  @IsUUID()
  school_id?: string;
}
