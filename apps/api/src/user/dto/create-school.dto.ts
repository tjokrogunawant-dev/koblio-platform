import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty({ example: 'Springfield Elementary' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'US', required: false })
  @IsOptional()
  @IsString()
  country?: string;
}
