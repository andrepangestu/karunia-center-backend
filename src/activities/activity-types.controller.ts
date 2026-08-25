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
import { ActivityTypesService } from './activity-types.service';
import { ActivityTypeResponseDto } from './dto/activity-type-response.dto';
import { CreateActivityTypeDto } from './dto/create-activity-type.dto';
import { QueryActivityTypesDto } from './dto/query-activity-types.dto';
import { UpdateActivityTypeDto } from './dto/update-activity-type.dto';

@ApiTags('Activity Types')
@ApiBearerAuth(SWAGGER_ACCESS_TOKEN)
@Controller('activity-types')
export class ActivityTypesController {
  constructor(private readonly activityTypesService: ActivityTypesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PENDAMPING)
  @ApiOperation({ summary: 'List activity types (PAGI, SIANG, MALAM, ...)' })
  @ApiResponse({ status: 200, description: 'Paginated activity type list' })
  findAll(@Query() query: QueryActivityTypesDto) {
    return this.activityTypesService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PENDAMPING)
  @ApiOperation({ summary: 'Get activity type detail' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ActivityTypeResponseDto })
  @ApiResponse({ status: 404, description: 'Activity type not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.activityTypesService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create activity type' })
  @ApiResponse({ status: 201, type: ActivityTypeResponseDto })
  @ApiResponse({ status: 409, description: 'Duplicate code' })
  create(@Body() dto: CreateActivityTypeDto) {
    return this.activityTypesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update activity type' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ActivityTypeResponseDto })
  @ApiResponse({ status: 404, description: 'Activity type not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActivityTypeDto,
  ) {
    return this.activityTypesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete activity type' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Activity type deleted' })
  @ApiResponse({
    status: 409,
    description: 'Activity type still has related records',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.activityTypesService.remove(id);
    return { id };
  }
}
