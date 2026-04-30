import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@koblio/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { AttemptService } from './attempt.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@ApiTags('Attempts')
@Controller('attempts')
export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {}

  @Post()
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Submit an answer to a problem' })
  async submitAnswer(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubmitAnswerDto) {
    return this.attemptService.submitAnswer(user.userId, dto);
  }

  @Get('me')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: "Get student's own attempt history (paginated)" })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getMyAttempts(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    const cappedLimit = Math.min(limit ?? 20, 100);
    const result = await this.attemptService.getStudentAttempts(user.userId, cappedLimit, offset);
    return {
      data: result.data,
      total: result.total,
      limit: cappedLimit,
      offset: offset ?? 0,
    };
  }

  @Get('me/stats')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: "Get student's aggregate stats" })
  async getMyStats(@CurrentUser() user: AuthenticatedUser) {
    return this.attemptService.getStudentStats(user.userId);
  }

  @Get('me/problem/:problemId')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: "Get student's attempts for a specific problem" })
  @ApiParam({ name: 'problemId', type: String, description: 'Problem UUID' })
  async getMyProblemAttempts(
    @CurrentUser() user: AuthenticatedUser,
    @Param('problemId', ParseUUIDPipe) problemId: string,
  ) {
    return this.attemptService.getStudentProblemAttempts(user.userId, problemId);
  }
}
