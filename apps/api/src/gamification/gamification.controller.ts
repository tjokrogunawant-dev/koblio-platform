import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { Public } from '../auth/decorators/public.decorator';

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
}
