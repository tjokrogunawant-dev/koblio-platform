import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MoodController } from './mood.controller';
import { MoodService } from './mood.service';

@Module({
  imports: [PrismaModule],
  controllers: [MoodController],
  providers: [MoodService],
  exports: [MoodService],
})
export class MoodModule {}
