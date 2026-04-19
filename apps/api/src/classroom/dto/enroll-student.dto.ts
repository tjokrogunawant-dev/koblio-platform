import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class EnrollStudentDto {
  @ApiProperty({ description: 'Student user ID to enroll' })
  @IsUUID()
  student_id!: string;
}
