import { SentryFilter } from './sentry.filter';
import { HttpAdapterHost } from '@nestjs/core';

describe('SentryFilter', () => {
  it('should be defined when instantiated with an adapter', () => {
    const mockAdapter = {
      httpAdapter: {
        reply: jest.fn(),
        status: jest.fn(),
        getRequestHostname: jest.fn(),
        getRequestMethod: jest.fn(),
        getRequestUrl: jest.fn(),
        isHeadersSent: jest.fn(),
      },
    } as unknown as HttpAdapterHost;

    const filter = new SentryFilter(mockAdapter.httpAdapter);
    expect(filter).toBeDefined();
  });
});
