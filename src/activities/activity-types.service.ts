import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, QueryFailedError, Repository } from 'typeorm';
import {
  PaginatedResult,
  buildPaginationMeta,
} from '../common/dto/pagination-meta.dto';
import { CreateActivityTypeDto } from './dto/create-activity-type.dto';
import { QueryActivityTypesDto } from './dto/query-activity-types.dto';
import { UpdateActivityTypeDto } from './dto/update-activity-type.dto';
import { ActivityTypeResponseDto } from './dto/activity-type-response.dto';
import { ActivityType } from './entities/activity-type.entity';

@Injectable()
export class ActivityTypesService {
  constructor(
    @InjectRepository(ActivityType)
    private readonly activityTypesRepository: Repository<ActivityType>,
  ) {}

  async create(dto: CreateActivityTypeDto): Promise<ActivityTypeResponseDto> {
    const type = this.activityTypesRepository.create({
      code: this.normalizeCode(dto.code),
      name: dto.name.trim(),
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.saveSafely(type);
    return this.toResponse(saved);
  }

  async findAll(
    query: QueryActivityTypesDto,
  ): Promise<PaginatedResult<ActivityTypeResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: FindOptionsWhere<ActivityType>[] = [];

    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      where.push({ code: ILike(term) }, { name: ILike(term) });
    }

    const [types, total] = await this.activityTypesRepository.findAndCount({
      where: where.length
        ? where.map((item) =>
            query.isActive === undefined
              ? item
              : { ...item, isActive: query.isActive },
          )
        : query.isActive === undefined
          ? undefined
          : { isActive: query.isActive },
      order: { sortOrder: 'ASC', code: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: types.map((type) => this.toResponse(type)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findActive(): Promise<ActivityType[]> {
    return this.activityTypesRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', code: 'ASC' },
    });
  }

  async findById(id: string): Promise<ActivityTypeResponseDto> {
    return this.toResponse(await this.getEntityById(id));
  }

  async update(
    id: string,
    dto: UpdateActivityTypeDto,
  ): Promise<ActivityTypeResponseDto> {
    const type = await this.getEntityById(id);

    if (dto.code !== undefined) {
      type.code = this.normalizeCode(dto.code);
    }
    if (dto.name !== undefined) {
      type.name = dto.name.trim();
    }
    if (dto.sortOrder !== undefined) {
      type.sortOrder = dto.sortOrder;
    }
    if (dto.isActive !== undefined) {
      type.isActive = dto.isActive;
    }

    const saved = await this.saveSafely(type);
    return this.toResponse(saved);
  }

  async remove(id: string): Promise<void> {
    const type = await this.getEntityById(id);

    try {
      await this.activityTypesRepository.remove(type);
    } catch (error) {
      this.rethrowConstraint(error);
    }
  }

  async getEntityById(id: string): Promise<ActivityType> {
    const type = await this.activityTypesRepository.findOne({ where: { id } });
    if (!type) {
      throw new NotFoundException('Activity type not found');
    }
    return type;
  }

  async getActiveEntityById(id: string): Promise<ActivityType> {
    const type = await this.getEntityById(id);
    if (!type.isActive) {
      throw new BadRequestException('Activity type is inactive');
    }
    return type;
  }

  toResponse(type: ActivityType): ActivityTypeResponseDto {
    return {
      id: type.id,
      code: type.code,
      name: type.name,
      sortOrder: type.sortOrder,
      isActive: type.isActive,
      createdAt: type.createdAt,
      updatedAt: type.updatedAt,
    };
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  private async saveSafely(type: ActivityType): Promise<ActivityType> {
    try {
      return await this.activityTypesRepository.save(type);
    } catch (error) {
      this.rethrowConstraint(error);
    }
  }

  private rethrowConstraint(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string };
      if (driverError?.code === '23505') {
        throw new ConflictException('Activity type code is already registered');
      }
      if (driverError?.code === '23503') {
        throw new ConflictException(
          'Activity type cannot be deleted because related records still exist',
        );
      }
    }
    throw error;
  }
}
