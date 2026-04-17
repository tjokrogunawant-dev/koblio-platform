import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ContentModule } from './content/content.module';
import { GamificationModule } from './gamification/gamification.module';
import { ClassroomModule } from './classroom/classroom.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ContentModule,
    GamificationModule,
    ClassroomModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
