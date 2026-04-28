import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Raw reset token from email link' })
  @IsString()
  @MinLength(64)
  token!: string;

  @ApiProperty({ example: 'NewSecurePassword1!' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
