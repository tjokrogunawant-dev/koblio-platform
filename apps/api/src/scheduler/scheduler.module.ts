import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MoodModule } from '../mood/mood.module';
import { MasteryModule } from '../mastery/mastery.module';
import { FsrsService } from './fsrs.service';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [PrismaModule, MoodModule, MasteryModule],
  providers: [FsrsService, SchedulerService],
  exports: [FsrsService, SchedulerService],
})
export class SchedulerModule {}
