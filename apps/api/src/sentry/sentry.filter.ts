import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class SentryFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
