import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryFailedError, Repository } from 'typeorm';
import {
  PaginatedResult,
  buildPaginationMeta,
} from '../common/dto/pagination-meta.dto';
import { BehaviorCatalogItemDto } from './dto/behavior-catalog-item.dto';
import {
  BehaviorCatalogItemResponseDto,
  BehaviorCategoryFormResponseDto,
  BehaviorCategoryResponseDto,
} from './dto/behavior-category-response.dto';
import { CreateBehaviorCategoryDto } from './dto/create-behavior-category.dto';
import { QueryBehaviorCategoriesDto } from './dto/query-behavior-categories.dto';
import { UpdateBehaviorCategoryDto } from './dto/update-behavior-category.dto';
import { UpsertBehaviorCatalogItemDto } from './dto/upsert-behavior-catalog-item.dto';
import { BehaviorCatalogItem } from './entities/behavior-catalog-item.entity';
import { BehaviorCategory } from './entities/behavior-category.entity';

@Injectable()
export class BehaviorCategoriesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(BehaviorCategory)
    private readonly categoriesRepository: Repository<BehaviorCategory>,
  ) {}

  async create(
    dto: CreateBehaviorCategoryDto,
  ): Promise<BehaviorCategoryResponseDto> {
    const savedId = await this.runAtomic(async () =>
      this.dataSource.transaction(async (manager) => {
        const categoryRepo = manager.getRepository(BehaviorCategory);
        const itemRepo = manager.getRepository(BehaviorCatalogItem);

        const category = await categoryRepo.save(
          categoryRepo.create({
            code: this.normalizeCode(dto.code),
            name: dto.name.trim(),
            sortOrder: dto.sortOrder ?? 0,
            isActive: dto.isActive ?? true,
          }),
        );

        await this.insertItems(itemRepo, category.id, dto.items ?? []);
        return category.id;
      }),
    );

    return this.findById(savedId);
  }

  async findAll(
    query: QueryBehaviorCategoriesDto,
  ): Promise<PaginatedResult<BehaviorCategoryResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.categoriesRepository
      .createQueryBuilder('category')
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.code', 'ASC');

    if (query.search?.trim()) {
      qb.andWhere(
        '(category.code ILIKE :search OR category.name ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }
    if (query.isActive !== undefined) {
      qb.andWhere('category.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    const [pageRows, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const ids = pageRows.map((row) => row.id);
    const withItems = ids.length
      ? await this.categoriesRepository.find({
          where: { id: In(ids) },
          relations: { items: true },
        })
      : [];
    const byId = new Map(withItems.map((category) => [category.id, category]));

    return {
      data: ids
        .map((id) => byId.get(id))
        .filter((category): category is BehaviorCategory => Boolean(category))
        .map((category) => this.toResponse(category)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findForm(): Promise<BehaviorCategoryFormResponseDto> {
    const categories = await this.categoriesRepository.find({
      where: { isActive: true },
      relations: { items: true },
      order: {
        sortOrder: 'ASC',
        code: 'ASC',
        items: { sortOrder: 'ASC' },
      },
    });

    return {
      groups: categories.map((category) => this.toResponse(category)),
    };
  }

  async findById(id: string): Promise<BehaviorCategoryResponseDto> {
    return this.toResponse(await this.getEntityById(id));
  }

  async getActiveCatalogItemById(id: string): Promise<BehaviorCatalogItem> {
    const item = await this.dataSource
      .getRepository(BehaviorCatalogItem)
      .findOne({
        where: { id },
        relations: { category: true },
      });
    if (!item) {
      throw new NotFoundException('Behavior catalog item not found');
    }
    if (!item.category.isActive) {
      throw new BadRequestException('Behavior category is inactive');
    }
    return item;
  }

  async update(
    id: string,
    dto: UpdateBehaviorCategoryDto,
  ): Promise<BehaviorCategoryResponseDto> {
    await this.getEntityById(id);

    await this.runAtomic(async () =>
      this.dataSource.transaction(async (manager) => {
        const categoryRepo = manager.getRepository(BehaviorCategory);
        const itemRepo = manager.getRepository(BehaviorCatalogItem);

        const category = await categoryRepo.findOne({ where: { id } });
        if (!category) {
          throw new NotFoundException('Behavior category not found');
        }

        if (dto.code !== undefined) {
          category.code = this.normalizeCode(dto.code);
        }
        if (dto.name !== undefined) {
          category.name = dto.name.trim();
        }
        if (dto.sortOrder !== undefined) {
          category.sortOrder = dto.sortOrder;
        }
        if (dto.isActive !== undefined) {
          category.isActive = dto.isActive;
        }

        await categoryRepo.save(category);

        if (dto.items) {
          await this.replaceItems(itemRepo, category.id, dto.items);
        }
      }),
    );

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const category = await this.getEntityById(id);
    await this.categoriesRepository.remove(category);
  }

  private async getEntityById(id: string): Promise<BehaviorCategory> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: { items: true },
    });
    if (!category) {
      throw new NotFoundException('Behavior category not found');
    }
    return category;
  }

  private async insertItems(
    repo: Repository<BehaviorCatalogItem>,
    categoryId: string,
    items: BehaviorCatalogItemDto[],
  ): Promise<void> {
    if (!items.length) {
      return;
    }
    await repo.save(
      items.map((item, index) =>
        repo.create({
          categoryId,
          name: item.name.trim(),
          sortOrder: item.sortOrder ?? index,
        }),
      ),
    );
  }

  private async replaceItems(
    repo: Repository<BehaviorCatalogItem>,
    categoryId: string,
    items: UpsertBehaviorCatalogItemDto[],
  ): Promise<void> {
    const existing = await repo.find({ where: { categoryId } });
    const incomingIds = items
      .map((item) => item.id)
      .filter((id): id is string => Boolean(id));

    for (const id of incomingIds) {
      if (!existing.some((item) => item.id === id)) {
        throw new BadRequestException(
          'Behavior catalog item does not belong to this category',
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
            categoryId,
            name: item.name.trim(),
            sortOrder: item.sortOrder ?? index,
          }),
        );
      }
    }
  }

  toResponse(category: BehaviorCategory): BehaviorCategoryResponseDto {
    return {
      id: category.id,
      code: category.code,
      name: category.name,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      items: [...(category.items ?? [])]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item): BehaviorCatalogItemResponseDto => ({
          id: item.id,
          name: item.name,
          sortOrder: item.sortOrder,
        })),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
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
      if (driverError?.code === '23505') {
        throw new ConflictException(
          'Behavior category code is already registered',
        );
      }
    }
    throw error;
  }
}
