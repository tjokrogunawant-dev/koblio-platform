import { Body, Controller, Get, Ip, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@koblio/shared';
import { UserService } from './user.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CreateChildAccountDto } from './dto/create-child-account.dto';
import { CreateSchoolDto } from './dto/create-school.dto';

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

  @Post('parents/me/children')
  @Roles(UserRole.PARENT)
  @ApiOperation({ summary: 'Create a child account (parent only)' })
  createChild(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateChildAccountDto,
    @Ip() ip: string,
  ) {
    return this.userService.createChildAccount(
      user.userId,
      dto,
      ip || 'unknown',
    );
  }

  @Get('parents/me/children')
  @Roles(UserRole.PARENT)
  @ApiOperation({ summary: 'List children linked to this parent' })
  listChildren(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.listChildren(user.userId);
  }

  @Post('schools')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a school (teacher/admin only)' })
  createSchool(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSchoolDto,
  ) {
    return this.userService.createSchool(user.userId, dto);
  }
}
