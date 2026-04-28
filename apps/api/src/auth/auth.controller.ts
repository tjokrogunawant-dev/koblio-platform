import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UserRole } from '@koblio/shared';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';
import { RegisterParentDto } from './dto/register-parent.dto';
import { RegisterTeacherDto } from './dto/register-teacher.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { EmailLoginDto } from './dto/login.dto';
import { StudentLoginDto } from './dto/student-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
  async registerParent(@Body() dto: RegisterParentDto, @Res({ passthrough: true }) res: Response) {
    const { authResult, refreshToken } = await this.authService.registerParent(dto);

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
    const { authResult, refreshToken } = await this.authService.registerTeacher(dto);

    if (refreshToken) {
      setRefreshCookie(res, refreshToken);
    }

    return authResult;
  }

  @Post('register/student')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new student account using a class code' })
  @ApiResponse({ status: 201, description: 'Student account created and enrolled' })
  @ApiResponse({ status: 409, description: 'Class code not found or username taken' })
  @ApiResponse({ status: 422, description: 'Validation failed' })
  async registerStudent(@Body() dto: RegisterStudentDto) {
    return this.authService.registerStudent(dto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login (parents and teachers via email)' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: EmailLoginDto, @Res({ passthrough: true }) res: Response) {
    const { authResult, refreshToken } = await this.authService.login(dto);

    if (refreshToken) {
      setRefreshCookie(res, refreshToken);
    }

    return authResult;
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate access token using refresh cookie' })
  @ApiResponse({ status: 200, description: 'New access token issued' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
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
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
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

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset link' })
  @ApiResponse({ status: 200, description: 'Reset link sent if email exists' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { message: "If that email is registered, you'll receive a reset link." };
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  @ApiResponse({ status: 200, description: 'Password updated' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { message: 'Password updated' };
  }

  @Post('login/student')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Student login via username and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async loginStudent(@Body() dto: StudentLoginDto) {
    return this.authService.loginStudent(dto);
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset link' })
  @ApiResponse({ status: 200, description: 'Reset link sent if email exists' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { message: "If that email is registered, you'll receive a reset link." };
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  @ApiResponse({ status: 200, description: 'Password updated' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { message: 'Password updated' };
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
