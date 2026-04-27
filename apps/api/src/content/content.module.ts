import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SchedulerModule } from '../scheduler/scheduler.module';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({
  imports: [PrismaModule, SchedulerModule],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
