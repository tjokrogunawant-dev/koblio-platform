import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  getStatus() {
    return { module: 'user', status: 'operational' };
  }
}
