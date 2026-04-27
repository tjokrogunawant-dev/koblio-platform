import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export const VALID_AVATAR_SLUGS = [
  'fox',
  'owl',
  'bear',
  'penguin',
  'cat',
  'dog',
  'rabbit',
  'dragon',
] as const;

export type AvatarSlug = (typeof VALID_AVATAR_SLUGS)[number];

export class UpdateAvatarDto {
  @ApiProperty({
    example: 'fox',
    enum: VALID_AVATAR_SLUGS,
    description: 'Avatar slug identifier',
  })
  @IsString()
  @IsIn(VALID_AVATAR_SLUGS)
  avatarSlug!: AvatarSlug;
}
