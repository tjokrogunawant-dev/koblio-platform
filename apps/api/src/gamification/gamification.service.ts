import { Injectable } from '@nestjs/common';

@Injectable()
export class GamificationService {
  getStatus() {
    return { module: 'gamification', status: 'operational' };
  }
}
