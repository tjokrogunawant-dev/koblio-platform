import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FsrsService } from './fsrs.service';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [PrismaModule],
  providers: [FsrsService, SchedulerService],
  exports: [FsrsService, SchedulerService],
})
export class SchedulerModule {}
