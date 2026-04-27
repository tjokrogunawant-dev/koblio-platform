import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AttemptModule } from '../attempt/attempt.module';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';

@Module({
  imports: [PrismaModule, AttemptModule],
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
