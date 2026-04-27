import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@koblio/shared';
import { ClassroomService } from './classroom.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';

@ApiTags('Classroom')
@Controller()
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Get('classrooms/status')
  @Public()
  @ApiOperation({ summary: 'Check classroom service status' })
  getStatus() {
    return this.classroomService.getStatus();
  }

  @Post('classrooms')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a classroom (teacher only)' })
  createClassroom(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateClassroomDto,
  ) {
    return this.classroomService.createClassroom(user.userId, dto);
  }

  @Get('classrooms/mine')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List classrooms taught by me' })
  listMyClassrooms(@CurrentUser() user: AuthenticatedUser) {
    return this.classroomService.listTeacherClassrooms(user.userId);
  }

  @Post('classrooms/:classroomId/students')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Enroll a student in a classroom' })
  enrollStudent(
    @Param('classroomId', ParseUUIDPipe) classroomId: string,
    @Body() dto: EnrollStudentDto,
  ) {
    return this.classroomService.enrollStudent(classroomId, dto);
  }

  @Get('classrooms/:classroomId/students')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List students enrolled in a classroom (with gamification data)' })
  listStudents(
    @CurrentUser() user: AuthenticatedUser,
    @Param('classroomId', ParseUUIDPipe) classroomId: string,
  ) {
    return this.classroomService.listClassroomStudents(classroomId, user.userId);
  }

  @Get('classrooms/:classroomId/progress')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get per-student progress summary for a classroom' })
  getClassroomProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('classroomId', ParseUUIDPipe) classroomId: string,
  ) {
    return this.classroomService.getClassroomProgress(classroomId, user.userId);
  }
}
