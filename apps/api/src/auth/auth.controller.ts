import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UserRole } from '@koblio/shared';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';
import { RegisterParentDto } from './dto/register-parent.dto';
import { RegisterTeacherDto } from './dto/register-teacher.dto';
import { EmailLoginDto, StudentLoginDto, ClassCodeLoginDto } from './dto/login.dto';

const REFRESH_COOKIE_NAME = 'koblio_refresh';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: '/api/auth',
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
}

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

  @Post('register/parent')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new parent account' })
  @ApiResponse({ status: 201, description: 'Account created' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 422, description: 'Validation failed' })
  async registerParent(
    @Body() dto: RegisterParentDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { authResult, refreshToken } =
      await this.authService.registerParent(dto);

    if (refreshToken) {
      setRefreshCookie(res, refreshToken);
    }

    return authResult;
  }

  @Post('register/teacher')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new teacher account' })
  @ApiResponse({ status: 201, description: 'Teacher account created' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 422, description: 'Validation failed' })
  async registerTeacher(
    @Body() dto: RegisterTeacherDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { authResult, refreshToken } =
      await this.authService.registerTeacher(dto);

    if (refreshToken) {
      setRefreshCookie(res, refreshToken);
    }

    return authResult;
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login (parents and teachers via email)' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: EmailLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { authResult, refreshToken } = await this.authService.login(dto);

    if (refreshToken) {
      setRefreshCookie(res, refreshToken);
    }

    return authResult;
  }

  @Post('login/student')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Student login with username and password' })
  @ApiResponse({ status: 200, description: 'Student login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async studentLogin(@Body() dto: StudentLoginDto) {
    const { authResult } = await this.authService.studentLogin(dto);
    return authResult;
  }

  @Post('login/class-code')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Student login via class code and picture password' })
  @ApiResponse({ status: 200, description: 'Class code login successful' })
  @ApiResponse({ status: 401, description: 'Invalid picture password' })
  @ApiResponse({ status: 404, description: 'Class code not found' })
  async classCodeLogin(@Body() dto: ClassCodeLoginDto) {
    const { authResult } = await this.authService.classCodeLogin(dto);
    return authResult;
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate access token using refresh cookie' })
  @ApiResponse({ status: 200, description: 'New access token issued' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        type: 'https://api.koblio.com/errors/auth',
        title: 'Missing refresh token',
        status: 401,
      });
    }

    const result = await this.authService.refresh(refreshToken);

    if (result.newRefreshToken) {
      setRefreshCookie(res, result.newRefreshToken);
    }

    return {
      access_token: result.access_token,
      expires_in: result.expires_in,
    };
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout (revokes refresh token, clears cookie)' })
  @ApiResponse({ status: 204, description: 'Logged out' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await this.authService.logout(refreshToken);
    clearRefreshCookie(res);
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

  @Get('student/check')
  @ApiBearerAuth()
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Verify student role access' })
  @ApiResponse({ status: 200, description: 'Student access confirmed' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  studentCheck(@CurrentUser() user: AuthenticatedUser) {
    return { student: true, userId: user.userId };
  }

  @Get('parent/check')
  @ApiBearerAuth()
  @Roles(UserRole.PARENT)
  @ApiOperation({ summary: 'Verify parent role access' })
  @ApiResponse({ status: 200, description: 'Parent access confirmed' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  parentCheck(@CurrentUser() user: AuthenticatedUser) {
    return { parent: true, userId: user.userId };
  }
}
