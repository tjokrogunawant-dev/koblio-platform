import { Body, Controller, Get, Ip, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@koblio/shared';
import { UserService } from './user.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CreateChildAccountDto } from './dto/create-child-account.dto';
import { CreateSchoolDto } from './dto/create-school.dto';
import { JoinClassDto } from './dto/join-class.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Users')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('users/status')
  @Public()
  @ApiOperation({ summary: 'Check user service status' })
  getStatus() {
    return this.userService.getStatus();
  }

  @Get('me/profile')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get student profile (avatar, coins, xp, level, streak)' })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getStudentProfileByAuth0Id(user.userId);
  }

  @Put('me/avatar')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Set avatar slug for the current student' })
  updateAvatar(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateAvatarDto) {
    return this.userService.updateAvatar(user.userId, dto.avatarSlug);
  }

  @Put('me/profile')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Update student display name and/or avatar' })
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user.userId, dto);
  }

  @Post('parents/me/children')
  @Roles(UserRole.PARENT)
  @ApiOperation({ summary: 'Create a child account (parent only)' })
  createChild(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateChildAccountDto,
    @Ip() ip: string,
  ) {
    return this.userService.createChildAccount(user.userId, dto, ip || 'unknown');
  }

  @Get('parents/me/children')
  @Roles(UserRole.PARENT)
  @ApiOperation({ summary: 'List children linked to this parent' })
  listChildren(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.listChildren(user.userId);
  }

  @Get('parents/me/children/:childId')
  @Roles(UserRole.PARENT)
  @ApiOperation({ summary: 'Get a single child profile (parent only)' })
  getChild(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId', ParseUUIDPipe) childId: string,
  ) {
    return this.userService.getChild(user.userId, childId);
  }

  @Post('parents/me/children/:childId/join-class')
  @Roles(UserRole.PARENT)
  @ApiOperation({ summary: 'Join a classroom via class code (parent only)' })
  joinClass(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId', ParseUUIDPipe) childId: string,
    @Body() dto: JoinClassDto,
  ) {
    return this.userService.joinClassByCode(user.userId, childId, dto);
  }

  @Post('schools')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a school (teacher/admin only)' })
  createSchool(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateSchoolDto) {
    return this.userService.createSchool(user.userId, dto);
  }

  @Get('schools/:schoolId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get school info with teacher and classroom counts' })
  getSchool(@Param('schoolId', ParseUUIDPipe) schoolId: string) {
    return this.userService.getSchool(schoolId);
  }
}
