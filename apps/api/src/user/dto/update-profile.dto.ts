import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { VALID_AVATAR_SLUGS, AvatarSlug } from './update-avatar.dto';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Alex' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  displayName?: string;

  @ApiPropertyOptional({ example: 'fox', enum: VALID_AVATAR_SLUGS })
  @IsOptional()
  @IsString()
  @IsIn(VALID_AVATAR_SLUGS)
  avatarSlug?: AvatarSlug;
}
