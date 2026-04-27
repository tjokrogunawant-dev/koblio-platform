import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SentryModule } from '@sentry/nestjs/setup';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { UserModule } from './user/user.module';
import { ContentModule } from './content/content.module';
import { GamificationModule } from './gamification/gamification.module';
import { ClassroomModule } from './classroom/classroom.module';
import { NotificationModule } from './notification/notification.module';
import { AttemptModule } from './attempt/attempt.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
    ContentModule,
    GamificationModule,
    ClassroomModule,
    NotificationModule,
    AttemptModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
