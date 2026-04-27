import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@koblio/shared';
import { AssignmentService } from './assignment.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';

@ApiTags('Assignments')
@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  // ─── P1-T30: Teacher creates assignment ──────────────────────────────────

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create an assignment for a classroom (teacher only)' })
  createAssignment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.assignmentService.createAssignment(user.userId, dto);
  }

  // ─── P1-T30: Teacher lists own assignments ────────────────────────────────

  @Get('mine')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List my assignments with classroom name and submission count' })
  listMyAssignments(@CurrentUser() user: AuthenticatedUser) {
    return this.assignmentService.listTeacherAssignments(user.userId);
  }

  // ─── P1-T31: Student sees pending assignments ─────────────────────────────

  @Get('student')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'List pending assignments for the authenticated student' })
  getStudentAssignments(@CurrentUser() user: AuthenticatedUser) {
    return this.assignmentService.getStudentAssignments(user.userId);
  }

  // ─── P1-T31: Student submits assignment ──────────────────────────────────

  @Post(':id/submit')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Submit answers for an assignment' })
  submitAssignment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) assignmentId: string,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.assignmentService.submitAssignment(
      user.userId,
      assignmentId,
      dto,
    );
  }
}
