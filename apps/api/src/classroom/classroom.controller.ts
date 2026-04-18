import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClassroomService } from './classroom.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Classroom')
@Controller('classrooms')
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Check classroom service status' })
  getStatus() {
    return this.classroomService.getStatus();
  }
}
