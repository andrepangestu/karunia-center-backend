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
import { BehaviorCategoriesService } from './behavior-categories.service';
import {
  BehaviorCategoryFormResponseDto,
  BehaviorCategoryResponseDto,
} from './dto/behavior-category-response.dto';
import { CreateBehaviorCategoryDto } from './dto/create-behavior-category.dto';
import { QueryBehaviorCategoriesDto } from './dto/query-behavior-categories.dto';
import { UpdateBehaviorCategoryDto } from './dto/update-behavior-category.dto';

@ApiTags('Behavior Categories')
@ApiBearerAuth(SWAGGER_ACCESS_TOKEN)
@Controller('behavior-categories')
export class BehaviorCategoriesController {
  constructor(
    private readonly behaviorCategoriesService: BehaviorCategoriesService,
  ) {}

  @Get('form')
  @Roles(UserRole.ADMIN, UserRole.PENDAMPING)
  @ApiOperation({
    summary: 'Active behavior catalog grouped for the daily form',
  })
  @ApiResponse({ status: 200, type: BehaviorCategoryFormResponseDto })
  findForm() {
    return this.behaviorCategoriesService.findForm();
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PENDAMPING)
  @ApiOperation({ summary: 'List behavior categories with nested items' })
  @ApiResponse({ status: 200, description: 'Paginated behavior category list' })
  findAll(@Query() query: QueryBehaviorCategoriesDto) {
    return this.behaviorCategoriesService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PENDAMPING)
  @ApiOperation({ summary: 'Get behavior category detail including items' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: BehaviorCategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Behavior category not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.behaviorCategoriesService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create behavior category with items' })
  @ApiResponse({ status: 201, type: BehaviorCategoryResponseDto })
  @ApiResponse({ status: 409, description: 'Duplicate code' })
  create(@Body() dto: CreateBehaviorCategoryDto) {
    return this.behaviorCategoriesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update category and replace-set items' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: BehaviorCategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Behavior category not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBehaviorCategoryDto,
  ) {
    return this.behaviorCategoriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete behavior category and its items' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Behavior category deleted' })
  @ApiResponse({ status: 404, description: 'Behavior category not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.behaviorCategoriesService.remove(id);
    return { id };
  }
}
