import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ConsentDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  accepted!: boolean;

  @ApiProperty({ example: '2026-05-10T12:00:00Z' })
  @IsString()
  timestamp!: string;

  @ApiProperty({ example: 'v1.2', required: false })
  @IsOptional()
  @IsString()
  consent_version?: string;
}

export class CreateChildAccountDto {
  @ApiProperty({ example: 'Bobby Zhang' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 6 })
  @IsInt()
  @Min(1)
  @Max(6)
  grade!: number;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    type: [String],
    minItems: 3,
    maxItems: 4,
    required: false,
    description: 'Picture password selections for K-2 students',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(3)
  @ArrayMaxSize(4)
  picture_password?: string[];

  @ApiProperty({ type: ConsentDto })
  @ValidateNested()
  @Type(() => ConsentDto)
  consent!: ConsentDto;
}
