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
  Query,
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
import { ActivitiesService } from './activities.service';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { QueryActivitiesDto } from './dto/query-activities.dto';
import { QueryStudentActivitiesDto } from './dto/query-student-activities.dto';
import { StudentActivitiesResponseDto } from './dto/student-activities-response.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@ApiTags('Activities')
@ApiBearerAuth(SWAGGER_ACCESS_TOKEN)
@Roles(UserRole.ADMIN, UserRole.PENDAMPING)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List activities' })
  @ApiResponse({ status: 200, description: 'Paginated activity list' })
  findAll(@Query() query: QueryActivitiesDto) {
    return this.activitiesService.findAll(query);
  }

  @Get('students/:studentId')
  @ApiOperation({
    summary: 'Get a student activity log with the daily activity-type gate',
  })
  @ApiParam({ name: 'studentId', format: 'uuid' })
  @ApiResponse({ status: 200, type: StudentActivitiesResponseDto })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query() query: QueryStudentActivitiesDto,
  ) {
    return this.activitiesService.findByStudent(studentId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get activity detail including kegiatan and materi',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ActivityResponseDto })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.activitiesService.findById(id);
  }

  @Post()
  @ApiOperation({
    summary:
      'Create daily activity. Materi is copied from the catalog when omitted; kegiatan scores use templateItemId.',
  })
  @ApiResponse({ status: 201, type: ActivityResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Missing kegiatan scores, invalid companion, catalog item, or time range',
  })
  @ApiResponse({ status: 409, description: 'Duplicate activity slot' })
  create(@Body() dto: CreateActivityDto) {
    return this.activitiesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update activity header and body atomically' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ActivityResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete activity' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Activity soft deleted' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.activitiesService.remove(id);
    return { id };
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a soft-deleted activity' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ActivityResponseDto })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.activitiesService.restore(id);
  }
}
