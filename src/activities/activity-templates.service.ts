import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryFailedError, Repository } from 'typeorm';
import {
  PaginatedResult,
  buildPaginationMeta,
} from '../common/dto/pagination-meta.dto';
import { ActivityTypesService } from './activity-types.service';
import { CreateActivityTemplateDto } from './dto/create-activity-template.dto';
import { QueryActivityTemplateFormDto } from './dto/query-activity-template-form.dto';
import { QueryActivityTemplatesDto } from './dto/query-activity-templates.dto';
import { UpdateActivityTemplateDto } from './dto/update-activity-template.dto';
import { ActivityTemplateItemDto } from './dto/activity-template-item.dto';
import { UpsertActivityTemplateItemDto } from './dto/upsert-activity-template-item.dto';
import {
  ActivityTemplateFormResponseDto,
  ActivityTemplateItemResponseDto,
  ActivityTemplateResponseDto,
} from './dto/activity-template-response.dto';
import { ActivityTemplate } from './entities/activity-template.entity';
import { ActivityTemplateItem } from './entities/activity-template-item.entity';
import { formatTimeRange, normalizeTime, toSeconds } from './utils/time.util';

@Injectable()
export class ActivityTemplatesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ActivityTemplate)
    private readonly templatesRepository: Repository<ActivityTemplate>,
    private readonly activityTypesService: ActivityTypesService,
  ) {}

  async create(
    dto: CreateActivityTemplateDto,
  ): Promise<ActivityTemplateResponseDto> {
    this.assertTimeRange(dto.startTime, dto.endTime);
    await this.activityTypesService.getActiveEntityById(dto.activityTypeId);

    const savedId = await this.runAtomic(async () =>
      this.dataSource.transaction(async (manager) => {
        const templateRepo = manager.getRepository(ActivityTemplate);
        const itemRepo = manager.getRepository(ActivityTemplateItem);

        const template = await templateRepo.save(
          templateRepo.create({
            activityTypeId: dto.activityTypeId,
            name: dto.name.trim(),
            startTime: normalizeTime(dto.startTime),
            endTime: normalizeTime(dto.endTime),
            sortOrder: dto.sortOrder ?? 0,
          }),
        );

        await this.insertItems(itemRepo, template.id, dto.items ?? []);
        return template.id;
      }),
    );

    return this.findById(savedId);
  }

  async findAll(
    query: QueryActivityTemplatesDto,
  ): Promise<PaginatedResult<ActivityTemplateResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.templatesRepository
      .createQueryBuilder('template')
      .leftJoin('template.activityType', 'activityType')
      .orderBy('activityType.sortOrder', 'ASC')
      .addOrderBy('activityType.code', 'ASC')
      .addOrderBy('template.sortOrder', 'ASC')
      .addOrderBy('template.startTime', 'ASC');

    if (query.activityTypeId) {
      qb.andWhere('template.activityTypeId = :activityTypeId', {
        activityTypeId: query.activityTypeId,
      });
    }
    if (query.search?.trim()) {
      qb.andWhere('template.name ILIKE :search', {
        search: `%${query.search.trim()}%`,
      });
    }

    const [pageRows, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const ids = pageRows.map((row) => row.id);
    const withItems = ids.length
      ? await this.templatesRepository.find({
          where: { id: In(ids) },
          relations: { items: true, activityType: true },
        })
      : [];
    const byId = new Map(withItems.map((template) => [template.id, template]));

    return {
      data: ids
        .map((id) => byId.get(id))
        .filter((template): template is ActivityTemplate => Boolean(template))
        .map((template) => this.toResponse(template)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findForm(
    query: QueryActivityTemplateFormDto,
  ): Promise<ActivityTemplateFormResponseDto> {
    const types = query.activityTypeId
      ? [await this.activityTypesService.getEntityById(query.activityTypeId)]
      : await this.activityTypesService.findActive();

    const qb = this.templatesRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.items', 'items')
      .leftJoinAndSelect('template.activityType', 'activityType')
      .orderBy('activityType.sortOrder', 'ASC')
      .addOrderBy('activityType.code', 'ASC')
      .addOrderBy('template.sortOrder', 'ASC')
      .addOrderBy('template.startTime', 'ASC')
      .addOrderBy('items.sortOrder', 'ASC');

    if (query.activityTypeId) {
      qb.andWhere('template.activityTypeId = :activityTypeId', {
        activityTypeId: query.activityTypeId,
      });
    } else {
      qb.andWhere('activityType.isActive = true');
    }

    const templates = await qb.getMany();
    const byTypeId = new Map<string, ActivityTemplate[]>();

    for (const template of templates) {
      const rows = byTypeId.get(template.activityTypeId) ?? [];
      rows.push(template);
      byTypeId.set(template.activityTypeId, rows);
    }

    return {
      groups: types.map((activityType) => ({
        activityType: this.activityTypesService.toResponse(activityType),
        slots: (byTypeId.get(activityType.id) ?? []).map((template) =>
          this.toResponse(template),
        ),
      })),
    };
  }

  async findEntitiesByActivityTypeId(
    activityTypeId: string,
  ): Promise<ActivityTemplate[]> {
    return this.templatesRepository.find({
      where: { activityTypeId },
      relations: { items: true },
      order: {
        sortOrder: 'ASC',
        startTime: 'ASC',
        items: { sortOrder: 'ASC' },
      },
    });
  }

  async findById(id: string): Promise<ActivityTemplateResponseDto> {
    const template = await this.getEntityById(id);
    return this.toResponse(template);
  }

  async update(
    id: string,
    dto: UpdateActivityTemplateDto,
  ): Promise<ActivityTemplateResponseDto> {
    await this.getEntityById(id);

    await this.runAtomic(async () =>
      this.dataSource.transaction(async (manager) => {
        const templateRepo = manager.getRepository(ActivityTemplate);
        const itemRepo = manager.getRepository(ActivityTemplateItem);

        const template = await templateRepo.findOne({ where: { id } });
        if (!template) {
          throw new NotFoundException('Activity template not found');
        }

        if (dto.activityTypeId !== undefined) {
          await this.activityTypesService.getActiveEntityById(
            dto.activityTypeId,
          );
          template.activityTypeId = dto.activityTypeId;
        }
        if (dto.name !== undefined) {
          template.name = dto.name.trim();
        }
        if (dto.startTime !== undefined) {
          template.startTime = normalizeTime(dto.startTime);
        }
        if (dto.endTime !== undefined) {
          template.endTime = normalizeTime(dto.endTime);
        }
        if (dto.sortOrder !== undefined) {
          template.sortOrder = dto.sortOrder;
        }

        this.assertTimeRange(template.startTime, template.endTime);
        await templateRepo.save(template);

        if (dto.items) {
          await this.replaceItems(itemRepo, template.id, dto.items);
        }
      }),
    );

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const template = await this.getEntityById(id);
    await this.templatesRepository.remove(template);
  }

  private async getEntityById(id: string): Promise<ActivityTemplate> {
    const template = await this.templatesRepository.findOne({
      where: { id },
      relations: { items: true, activityType: true },
    });
    if (!template) {
      throw new NotFoundException('Activity template not found');
    }
    return template;
  }

  private assertTimeRange(startTime: string, endTime: string): void {
    if (toSeconds(endTime) === toSeconds(startTime)) {
      throw new BadRequestException(
        'Template start and end time must be different',
      );
    }
  }

  private async insertItems(
    repo: Repository<ActivityTemplateItem>,
    templateId: string,
    items: ActivityTemplateItemDto[],
  ): Promise<void> {
    if (!items.length) {
      return;
    }
    await repo.save(
      items.map((item, index) =>
        repo.create({
          templateId,
          name: item.name.trim(),
          sortOrder: item.sortOrder ?? index,
        }),
      ),
    );
  }

  private async replaceItems(
    repo: Repository<ActivityTemplateItem>,
    templateId: string,
    items: UpsertActivityTemplateItemDto[],
  ): Promise<void> {
    const existing = await repo.find({ where: { templateId } });
    const incomingIds = items
      .map((item) => item.id)
      .filter((id): id is string => Boolean(id));

    for (const id of incomingIds) {
      if (!existing.some((item) => item.id === id)) {
        throw new BadRequestException(
          'Activity template item does not belong to this template',
        );
      }
    }

    const removed = existing.filter((item) => !incomingIds.includes(item.id));
    if (removed.length) {
      await repo.remove(removed);
    }

    for (const [index, item] of items.entries()) {
      if (item.id) {
        const current = existing.find((row) => row.id === item.id);
        if (!current) {
          continue;
        }
        current.name = item.name.trim();
        current.sortOrder = item.sortOrder ?? index;
        await repo.save(current);
      } else {
        await repo.save(
          repo.create({
            templateId,
            name: item.name.trim(),
            sortOrder: item.sortOrder ?? index,
          }),
        );
      }
    }
  }

  private toResponse(template: ActivityTemplate): ActivityTemplateResponseDto {
    return {
      id: template.id,
      activityType: this.activityTypesService.toResponse(template.activityType),
      name: template.name,
      startTime: template.startTime,
      endTime: template.endTime,
      timeRange: formatTimeRange(template.startTime, template.endTime),
      sortOrder: template.sortOrder,
      items: [...(template.items ?? [])]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item): ActivityTemplateItemResponseDto => ({
          id: item.id,
          name: item.name,
          sortOrder: item.sortOrder,
        })),
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  private async runAtomic<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.rethrowConstraint(error);
    }
  }

  private rethrowConstraint(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string };
      if (driverError?.code === '23514') {
        throw new BadRequestException(
          'Template start and end time must be different',
        );
      }
    }
    throw error;
  }
}
