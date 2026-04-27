import { Module } from '@nestjs/common';
import { SentryModule as SentryNestModule } from '@sentry/nestjs/setup';
import { SentryController } from './sentry.controller';

@Module({
  imports: [SentryNestModule.forRoot()],
  controllers: [SentryController],
})
export class SentryModule {}
