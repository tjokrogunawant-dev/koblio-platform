import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class RegisterStudentDto {
  @ApiProperty({ example: 'ABC123', description: 'Class code provided by teacher' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  classCode!: string;

  @ApiProperty({ example: 'Alex', description: 'Display name shown on leaderboard' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  displayName!: string;

  @ApiProperty({ example: 'alex1234', description: 'Unique username for login' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username may only contain letters, numbers, and underscores',
  })
  username!: string;

  @ApiProperty({ minLength: 6, maxLength: 72 })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password!: string;
}
