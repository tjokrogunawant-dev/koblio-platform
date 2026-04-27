import { Controller, Get, Param, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { GamificationService } from './gamification.service';

@ApiTags('Gamification')
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Check gamification service status' })
  getStatus() {
    return this.gamificationService.getStatus();
  }

  @Get('me')
  @Roles('student')
  @ApiOperation({ summary: "Get student's gamification profile (coins, XP, level, streak)" })
  async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.gamificationService.getStudentProfile(user.userId);
  }

  @Get('leaderboard/:classroomId')
  @Roles('student')
  @ApiOperation({ summary: 'Get weekly class leaderboard (top 10 + own rank)' })
  @ApiParam({ name: 'classroomId', type: String, description: 'Classroom UUID' })
  async getLeaderboard(
    @CurrentUser() user: AuthenticatedUser,
    @Param('classroomId', ParseUUIDPipe) classroomId: string,
  ) {
    return this.gamificationService.getClassLeaderboard(classroomId, user.userId);
  }

  @Get('daily-challenge/:grade')
  @Public()
  @ApiOperation({ summary: 'Get daily challenge problem for a grade (deterministic by day)' })
  @ApiParam({ name: 'grade', type: Number, description: 'Grade level (1-6)' })
  async getDailyChallenge(@Param('grade', ParseIntPipe) grade: number) {
    return this.gamificationService.getDailyChallenge(grade);
  }
}
