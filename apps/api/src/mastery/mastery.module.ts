import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BktService } from './bkt.service';
import { MasteryController } from './mastery.controller';
import { MasteryService } from './mastery.service';

@Module({
  imports: [PrismaModule],
  controllers: [MasteryController],
  providers: [BktService, MasteryService],
  exports: [BktService, MasteryService],
})
export class MasteryModule {}
