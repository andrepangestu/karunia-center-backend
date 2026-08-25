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
import { ActivityTemplatesService } from './activity-templates.service';
import {
  ActivityTemplateFormResponseDto,
  ActivityTemplateResponseDto,
} from './dto/activity-template-response.dto';
import { CreateActivityTemplateDto } from './dto/create-activity-template.dto';
import { QueryActivityTemplateFormDto } from './dto/query-activity-template-form.dto';
import { QueryActivityTemplatesDto } from './dto/query-activity-templates.dto';
import { UpdateActivityTemplateDto } from './dto/update-activity-template.dto';

@ApiTags('Activity Templates')
@Controller('activity-templates')
export class ActivityTemplatesController {
  constructor(
    private readonly activityTemplatesService: ActivityTemplatesService,
  ) {}

  @Get('form')
  @ApiBearerAuth(SWAGGER_ACCESS_TOKEN)
  @Roles(UserRole.ADMIN, UserRole.PENDAMPING)
  @ApiOperation({
    summary: 'Form grouped by activity type',
  })
  @ApiResponse({ status: 200, type: ActivityTemplateFormResponseDto })
  findForm(@Query() query: QueryActivityTemplateFormDto) {
    return this.activityTemplatesService.findForm(query);
  }

  @Get()
  @ApiBearerAuth(SWAGGER_ACCESS_TOKEN)
  @Roles(UserRole.ADMIN, UserRole.PENDAMPING)
  @ApiOperation({ summary: 'List templates with nested items' })
  @ApiResponse({ status: 200, description: 'Paginated activity template list' })
  findAll(@Query() query: QueryActivityTemplatesDto) {
    return this.activityTemplatesService.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth(SWAGGER_ACCESS_TOKEN)
  @Roles(UserRole.ADMIN, UserRole.PENDAMPING)
  @ApiOperation({ summary: 'Get template detail including items' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ActivityTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Activity template not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.activityTemplatesService.findById(id);
  }

  @Post()
  @ApiBearerAuth(SWAGGER_ACCESS_TOKEN)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create template with items' })
  @ApiResponse({ status: 201, type: ActivityTemplateResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid time range' })
  create(@Body() dto: CreateActivityTemplateDto) {
    return this.activityTemplatesService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth(SWAGGER_ACCESS_TOKEN)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update template and replace-set items' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ActivityTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Activity template not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActivityTemplateDto,
  ) {
    return this.activityTemplatesService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth(SWAGGER_ACCESS_TOKEN)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete template and its items' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Activity template deleted' })
  @ApiResponse({ status: 404, description: 'Activity template not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.activityTemplatesService.remove(id);
    return { id };
  }
}
