import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SWAGGER_ACCESS_TOKEN } from '../common/constants/auth.constants';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { BehaviorReportsService } from './behavior-reports.service';
import { BehaviorReportResponseDto } from './dto/behavior-report-response.dto';
import { CreateBehaviorReportDto } from './dto/create-behavior-report.dto';
import { UpdateBehaviorReportDto } from './dto/update-behavior-report.dto';

@ApiTags('Behavior Reports')
@ApiBearerAuth(SWAGGER_ACCESS_TOKEN)
@Roles(UserRole.ADMIN, UserRole.PENDAMPING)
@Controller()
export class BehaviorReportsController {
  constructor(
    private readonly behaviorReportsService: BehaviorReportsService,
  ) {}

  @Get('activities/:activityId/behavior-reports')
  @ApiOperation({ summary: 'List behavior reports for an activity' })
  @ApiParam({ name: 'activityId', format: 'uuid' })
  @ApiResponse({ status: 200, type: [BehaviorReportResponseDto] })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  findByActivity(@Param('activityId', ParseUUIDPipe) activityId: string) {
    return this.behaviorReportsService.findByActivity(activityId);
  }

  @Post('activities/:activityId/behavior-reports')
  @ApiOperation({ summary: 'Submit an observed behavior for an activity' })
  @ApiParam({ name: 'activityId', format: 'uuid' })
  @ApiResponse({ status: 201, type: BehaviorReportResponseDto })
  @ApiResponse({
    status: 404,
    description: 'Activity or catalog item not found',
  })
  @ApiResponse({ status: 409, description: 'Behavior already reported' })
  create(
    @Param('activityId', ParseUUIDPipe) activityId: string,
    @Body() dto: CreateBehaviorReportDto,
  ) {
    return this.behaviorReportsService.create(activityId, dto);
  }

  @Patch('behavior-reports/:id')
  @ApiOperation({ summary: 'Update a behavior report score or description' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: BehaviorReportResponseDto })
  @ApiResponse({ status: 404, description: 'Behavior report not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBehaviorReportDto,
  ) {
    return this.behaviorReportsService.update(id, dto);
  }

  @Delete('behavior-reports/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a behavior report' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Behavior report deleted' })
  @ApiResponse({ status: 404, description: 'Behavior report not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.behaviorReportsService.remove(id);
    return { id };
  }
}
