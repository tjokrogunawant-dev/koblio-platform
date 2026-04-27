import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { MasteryService } from './mastery.service';

@ApiTags('Mastery')
@Controller('mastery')
export class MasteryController {
  constructor(private readonly masteryService: MasteryService) {}

  @Get('me')
  @Roles('student')
  @ApiOperation({ summary: "Get all skill masteries for the current student" })
  async getMyMasteries(@CurrentUser() user: AuthenticatedUser) {
    const masteries = await this.masteryService.getStudentMasteries(user.userId);
    return {
      skills: masteries.map((m) => ({
        skill: m.skill,
        masteryProb: m.masteryProb,
        mastered: m.mastered,
        attemptCount: m.attemptCount,
      })),
    };
  }
}
