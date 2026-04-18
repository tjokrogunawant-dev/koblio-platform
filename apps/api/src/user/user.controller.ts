import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Check user service status' })
  getStatus() {
    return this.userService.getStatus();
  }
}
