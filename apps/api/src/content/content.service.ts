import { Injectable } from '@nestjs/common';

@Injectable()
export class ContentService {
  getStatus() {
    return { module: 'content', status: 'operational' };
  }
}
