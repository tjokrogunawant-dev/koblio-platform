import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@koblio/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { MoodService } from './mood.service';

@ApiTags('Mood')
@Controller('mood')
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Get('me')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get current mood state and scheduler weight shifts for the authenticated student' })
  async getMyMood(@CurrentUser() user: AuthenticatedUser) {
    return this.moodService.getMoodWeights(user.userId);
  }
}
