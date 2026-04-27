import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayMaxSize,
  IsArray,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AssignmentAnswerDto {
  @ApiProperty({ description: 'UUID of the problem being answered' })
  @IsUUID()
  problemId!: string;

  @ApiProperty({ description: 'The answer submitted by the student' })
  @IsString()
  answer!: string;
}

export class SubmitAssignmentDto {
  @ApiProperty({ type: [AssignmentAnswerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => AssignmentAnswerDto)
  answers!: AssignmentAnswerDto[];
}
