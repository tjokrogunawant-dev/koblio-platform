import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';

@ApiTags('Gamification')
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check gamification service status' })
  getStatus() {
    return this.gamificationService.getStatus();
  }
}
