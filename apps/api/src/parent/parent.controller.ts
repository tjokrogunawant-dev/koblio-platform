import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@koblio/shared';
import { ParentService } from './parent.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Parent')
@Controller('parent')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  // ─── P1-T33: Parent views child progress ─────────────────────────────────

  @Get('children/:childId/progress')
  @Roles(UserRole.PARENT, UserRole.ADMIN)
  @ApiOperation({ summary: "View a child's progress (parent must be linked to child)" })
  getChildProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId', ParseUUIDPipe) childId: string,
  ) {
    return this.parentService.getChildProgress(user.userId, childId);
  }
}
