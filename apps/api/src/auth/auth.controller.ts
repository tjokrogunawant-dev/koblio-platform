import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@koblio/shared';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Check authentication service status' })
  getStatus() {
    return this.authService.getStatus();
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user info' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return {
      userId: user.userId,
      email: user.email,
      roles: user.roles,
    };
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout (revokes refresh token, clears cookie)' })
  @ApiResponse({ status: 204, description: 'Logged out' })
  logout() {
    // Refresh token revocation will be implemented in P1-T10
  }

  @Get('admin/check')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Verify admin role access' })
  @ApiResponse({ status: 200, description: 'Admin access confirmed' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  adminCheck(@CurrentUser() user: AuthenticatedUser) {
    return { admin: true, userId: user.userId };
  }

  @Get('teacher/check')
  @ApiBearerAuth()
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Verify teacher role access' })
  @ApiResponse({ status: 200, description: 'Teacher access confirmed' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  teacherCheck(@CurrentUser() user: AuthenticatedUser) {
    return { teacher: true, userId: user.userId };
  }
}
