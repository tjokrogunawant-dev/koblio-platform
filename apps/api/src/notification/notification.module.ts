import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { DigestService } from './digest.service';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationService, EmailService, DigestService],
  exports: [NotificationService, EmailService, DigestService],
})
export class NotificationModule {}
