import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GamificationModule } from '../gamification/gamification.module';
import { BadgeModule } from '../badge/badge.module';
import { MasteryModule } from '../mastery/mastery.module';
import { SchedulerModule } from '../scheduler/scheduler.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { AttemptController } from './attempt.controller';
import { AttemptService } from './attempt.service';

@Module({
  imports: [PrismaModule, GamificationModule, BadgeModule, MasteryModule, SchedulerModule, LeaderboardModule],
  controllers: [AttemptController],
  providers: [AttemptService],
  exports: [AttemptService],
})
export class AttemptModule {}
