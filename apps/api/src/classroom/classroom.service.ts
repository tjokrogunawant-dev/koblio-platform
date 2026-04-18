import { Injectable } from '@nestjs/common';

@Injectable()
export class ClassroomService {
  getStatus() {
    return { module: 'classroom', status: 'operational' };
  }
}
