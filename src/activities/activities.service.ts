import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import {
  PaginatedResult,
  buildPaginationMeta,
} from '../common/dto/pagination-meta.dto';
import { StudentsService } from '../students/students.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateActivityDto } from './dto/create-activity.dto';
import { QueryActivitiesDto } from './dto/query-activities.dto';
import { QueryStudentActivitiesDto } from './dto/query-student-activities.dto';
import { StudentActivitiesResponseDto } from './dto/student-activities-response.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import {
  ActivityItemResponseDto,
  ActivityMaterialResponseDto,
  ActivityResponseDto,
} from './dto/activity-response.dto';
import { ActivityItemDto } from './dto/activity-item.dto';
import { ActivityMaterialDto } from './dto/activity-material.dto';
import { SubmitActivityItemDto } from './dto/submit-activity-item.dto';
import { UpsertActivityItemDto } from './dto/upsert-activity-item.dto';
import { UpsertActivityMaterialDto } from './dto/upsert-activity-material.dto';
import { Activity } from './entities/activity.entity';
import { ActivityItem } from './entities/activity-item.entity';
import { ActivityMaterial } from './entities/activity-material.entity';
import { ActivityTemplate } from './entities/activity-template.entity';
import { ActivityTemplatesService } from './activity-templates.service';
import { ActivityTypesService } from './activity-types.service';
import {
  buildActivityGate,
  sortActivitiesByType,
} from './utils/activity-gate.util';
import {
  formatTimeRange,
  normalizeTime,
  toSeconds,
  todayDate,
} from './utils/time.util';

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
    private readonly studentsService: StudentsService,
    private readonly usersService: UsersService,
    private readonly activityTemplatesService: ActivityTemplatesService,
    private readonly activityTypesService: ActivityTypesService,
  ) {}

  async create(dto: CreateActivityDto): Promise<ActivityResponseDto> {
    const student = await this.studentsService.getEntityById(dto.studentId);
    const companion = await this.getPendamping(dto.companionId);
    const activityType = await this.activityTypesService.getActiveEntityById(
      dto.activityTypeId,
    );
    const templates =
      await this.activityTemplatesService.findEntitiesByActivityTypeId(
        activityType.id,
      );
    const materials = dto.materials ?? this.materialsFromTemplates(templates);
    const items = this.resolveItems(dto.items, templates);
    this.assertMaterialTimes(materials);

    const savedId = await this.runAtomic(async () =>
      this.dataSource.transaction(async (manager) => {
        const activityRepo = manager.getRepository(Activity);
        const itemRepo = manager.getRepository(ActivityItem);
        const materialRepo = manager.getRepository(ActivityMaterial);

        await this.assertUniqueSlot(
          activityRepo,
          dto.studentId,
          dto.activityDate,
          activityType.id,
        );

        const activity = await activityRepo.save(
          activityRepo.create({
            activityTypeId: activityType.id,
            activityDate: dto.activityDate,
            companionId: companion.id,
            studentId: student.id,
            description: dto.description?.trim() ?? null,
          }),
        );

        await this.insertItems(itemRepo, activity.id, items);
        await this.insertMaterials(materialRepo, activity.id, materials);

        return activity.id;
      }),
    );

    return this.findById(savedId);
  }

  async findAll(
    query: QueryActivitiesDto,
  ): Promise<PaginatedResult<ActivityResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.activitiesRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.student', 'student')
      .leftJoinAndSelect('activity.companion', 'companion')
      .leftJoinAndSelect('activity.activityType', 'activityType')
      .orderBy('activity.activityDate', 'DESC')
      .addOrderBy('activity.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.activityTypeId) {
      qb.andWhere('activity.activityTypeId = :activityTypeId', {
        activityTypeId: query.activityTypeId,
      });
    }
    if (query.date) {
      qb.andWhere('activity.activityDate = :date', { date: query.date });
    } else {
      if (query.dateFrom) {
        qb.andWhere('activity.activityDate >= :dateFrom', {
          dateFrom: query.dateFrom,
        });
      }
      if (query.dateTo) {
        qb.andWhere('activity.activityDate <= :dateTo', {
          dateTo: query.dateTo,
        });
      }
    }
    if (query.studentId) {
      qb.andWhere('activity.studentId = :studentId', {
        studentId: query.studentId,
      });
    }
    if (query.companionId) {
      qb.andWhere('activity.companionId = :companionId', {
        companionId: query.companionId,
      });
    }

    const [activities, total] = await qb.getManyAndCount();

    return {
      data: activities.map((activity) => this.toResponse(activity, false)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findByStudent(
    studentId: string,
    query: QueryStudentActivitiesDto,
  ): Promise<StudentActivitiesResponseDto> {
    const student = await this.studentsService.getEntityById(studentId);
    const { dateFrom, dateTo, fillEmptyDate } =
      this.resolveStudentDateRange(query);
    const requiredTypes = await this.activityTypesService.findActive();

    const qb = this.activitiesRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.student', 'student')
      .leftJoinAndSelect('activity.companion', 'companion')
      .leftJoinAndSelect('activity.activityType', 'activityType')
      .leftJoinAndSelect('activity.items', 'items')
      .leftJoinAndSelect('activity.materials', 'materials')
      .where('activity.studentId = :studentId', { studentId })
      .orderBy('activity.activityDate', 'DESC')
      .addOrderBy('activity.createdAt', 'ASC');

    if (dateFrom) {
      qb.andWhere('activity.activityDate >= :dateFrom', { dateFrom });
    }
    if (dateTo) {
      qb.andWhere('activity.activityDate <= :dateTo', { dateTo });
    }

    const activities = await qb.getMany();
    const byDate = new Map<string, Activity[]>();

    for (const activity of activities) {
      const date = this.toDateString(activity.activityDate);
      const rows = byDate.get(date) ?? [];
      rows.push(activity);
      byDate.set(date, rows);
    }

    const dates = fillEmptyDate
      ? [fillEmptyDate]
      : [...byDate.keys()].sort((a, b) => b.localeCompare(a));

    return {
      student: {
        id: student.id,
        name: student.name,
        nis: student.nis,
        class: student.className,
      },
      days: dates.map((date) => {
        const dayActivities = sortActivitiesByType(byDate.get(date) ?? []);
        return {
          date,
          gate: buildActivityGate(
            requiredTypes.map((type) =>
              this.activityTypesService.toResponse(type),
            ),
            dayActivities.map((activity) => activity.activityTypeId),
          ),
          activities: dayActivities.map((activity) =>
            this.toResponse(activity, true),
          ),
        };
      }),
    };
  }

  async findById(id: string): Promise<ActivityResponseDto> {
    const activity = await this.getEntityById(id, true);
    return this.toResponse(activity, true);
  }

  async update(
    id: string,
    dto: UpdateActivityDto,
  ): Promise<ActivityResponseDto> {
    await this.getEntityById(id, false);

    if (dto.studentId) {
      await this.studentsService.getEntityById(dto.studentId);
    }
    if (dto.companionId) {
      await this.getPendamping(dto.companionId);
    }
    if (dto.activityTypeId) {
      await this.activityTypesService.getActiveEntityById(dto.activityTypeId);
    }
    if (dto.materials) {
      this.assertMaterialTimes(dto.materials);
    }

    await this.runAtomic(async () =>
      this.dataSource.transaction(async (manager) => {
        const activityRepo = manager.getRepository(Activity);
        const itemRepo = manager.getRepository(ActivityItem);
        const materialRepo = manager.getRepository(ActivityMaterial);

        const activity = await activityRepo.findOne({ where: { id } });
        if (!activity) {
          throw new NotFoundException('Activity not found');
        }

        if (dto.activityTypeId !== undefined) {
          activity.activityTypeId = dto.activityTypeId;
        }
        if (dto.activityDate !== undefined) {
          activity.activityDate = dto.activityDate;
        }
        if (dto.companionId !== undefined) {
          activity.companionId = dto.companionId;
        }
        if (dto.studentId !== undefined) {
          activity.studentId = dto.studentId;
        }
        if (dto.description !== undefined) {
          activity.description = dto.description?.trim() ?? null;
        }

        await this.assertUniqueSlot(
          activityRepo,
          activity.studentId,
          activity.activityDate,
          activity.activityTypeId,
          activity.id,
        );

        await activityRepo.save(activity);

        if (dto.items) {
          await this.replaceItems(itemRepo, activity.id, dto.items);
        }
        if (dto.materials) {
          await this.replaceMaterials(materialRepo, activity.id, dto.materials);
        }
      }),
    );

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.getEntityById(id, false);
    await this.activitiesRepository.softDelete(id);
  }

  async restore(id: string): Promise<ActivityResponseDto> {
    const activity = await this.activitiesRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    if (!activity.deletedAt) {
      throw new BadRequestException('Activity is not deleted');
    }

    try {
      await this.activitiesRepository.restore(id);
    } catch (error) {
      this.rethrowConstraint(error);
    }

    return this.findById(id);
  }

  async getEntityById(id: string, withBody: boolean): Promise<Activity> {
    const activity = await this.activitiesRepository.findOne({
      where: { id },
      relations: {
        student: true,
        companion: true,
        activityType: true,
        items: withBody,
        materials: withBody,
      },
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    return activity;
  }

  private resolveStudentDateRange(query: QueryStudentActivitiesDto): {
    dateFrom?: string;
    dateTo?: string;
    fillEmptyDate?: string;
  } {
    if (query.date) {
      return {
        dateFrom: query.date,
        dateTo: query.date,
        fillEmptyDate: query.date,
      };
    }

    if (!query.dateFrom && !query.dateTo) {
      const today = todayDate();
      return { dateFrom: today, dateTo: today, fillEmptyDate: today };
    }

    if (query.dateFrom && query.dateTo && query.dateFrom > query.dateTo) {
      throw new BadRequestException(
        'dateFrom must be before or equal to dateTo',
      );
    }

    return { dateFrom: query.dateFrom, dateTo: query.dateTo };
  }

  private toDateString(value: string | Date): string {
    if (typeof value === 'string') {
      return value.slice(0, 10);
    }
    return value.toISOString().slice(0, 10);
  }

  private normalizeNote(note?: string | null): string | null {
    const trimmed = note?.trim();
    return trimmed ? trimmed : null;
  }

  private async getPendamping(companionId: string): Promise<User> {
    const user = await this.usersService.findAuthById(companionId);
    if (!user) {
      throw new NotFoundException('Companion not found');
    }
    if (user.role !== UserRole.PENDAMPING) {
      throw new BadRequestException('Companion must have role PENDAMPING');
    }
    return user;
  }

  private async assertUniqueSlot(
    repo: Repository<Activity>,
    studentId: string,
    activityDate: string,
    activityTypeId: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await repo.findOne({
      where: { studentId, activityDate, activityTypeId },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        'An activity of this type already exists for this student on this date',
      );
    }
  }

  private materialsFromTemplates(
    templates: ActivityTemplate[],
  ): ActivityMaterialDto[] {
    return templates.map((template, index) => ({
      name: template.name,
      startTime: template.startTime,
      endTime: template.endTime,
      sortOrder: template.sortOrder ?? index,
    }));
  }

  private resolveItems(
    items: SubmitActivityItemDto[],
    templates: ActivityTemplate[],
  ): ActivityItemDto[] {
    if (!items.length) {
      throw new BadRequestException('Kegiatan scores are required');
    }

    const catalogItems = new Map(
      templates.flatMap((template) =>
        [...(template.items ?? [])]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => [item.id, item] as const),
      ),
    );
    const scoredCatalogIds = new Set<string>();

    const resolved = items.map((item, index) => {
      if (!item.templateItemId) {
        if (!item.name?.trim()) {
          throw new BadRequestException(
            'Item name is required when templateItemId is omitted',
          );
        }
        return {
          name: item.name,
          value: item.value,
          note: this.normalizeNote(item.note),
          sortOrder: item.sortOrder ?? index,
        };
      }

      if (scoredCatalogIds.has(item.templateItemId)) {
        throw new BadRequestException('Duplicate templateItemId');
      }

      const catalogItem = catalogItems.get(item.templateItemId);
      if (!catalogItem) {
        throw new BadRequestException(
          'Activity template item does not belong to this activity type',
        );
      }

      scoredCatalogIds.add(item.templateItemId);

      return {
        name: catalogItem.name,
        value: item.value,
        note: this.normalizeNote(item.note),
        sortOrder: item.sortOrder ?? catalogItem.sortOrder ?? index,
      };
    });

    if (catalogItems.size > 0 && scoredCatalogIds.size !== catalogItems.size) {
      throw new BadRequestException(
        'All catalog kegiatan must be scored for this activity type',
      );
    }

    return resolved;
  }

  private assertMaterialTimes(
    materials: Array<{ startTime: string; endTime: string }>,
  ): void {
    for (const material of materials) {
      if (toSeconds(material.endTime) === toSeconds(material.startTime)) {
        throw new BadRequestException(
          'Material start and end time must be different',
        );
      }
    }
  }

  private async insertItems(
    repo: Repository<ActivityItem>,
    activityId: string,
    items: ActivityItemDto[],
  ): Promise<void> {
    if (!items.length) {
      return;
    }
    await repo.save(
      items.map((item, index) =>
        repo.create({
          activityId,
          name: item.name.trim(),
          value: item.value,
          note: this.normalizeNote(item.note),
          sortOrder: item.sortOrder ?? index,
        }),
      ),
    );
  }

  private async insertMaterials(
    repo: Repository<ActivityMaterial>,
    activityId: string,
    materials: ActivityMaterialDto[],
  ): Promise<void> {
    if (!materials.length) {
      return;
    }
    await repo.save(
      materials.map((material, index) =>
        repo.create({
          activityId,
          name: material.name.trim(),
          startTime: normalizeTime(material.startTime),
          endTime: normalizeTime(material.endTime),
          sortOrder: material.sortOrder ?? index,
        }),
      ),
    );
  }

  private async replaceItems(
    repo: Repository<ActivityItem>,
    activityId: string,
    items: UpsertActivityItemDto[],
  ): Promise<void> {
    const existing = await repo.find({ where: { activityId } });
    const incomingIds = items
      .map((item) => item.id)
      .filter((id): id is string => Boolean(id));

    for (const id of incomingIds) {
      if (!existing.some((item) => item.id === id)) {
        throw new BadRequestException(
          'Activity item does not belong to this activity',
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
        current.value = item.value;
        current.note = this.normalizeNote(item.note);
        current.sortOrder = item.sortOrder ?? index;
        await repo.save(current);
      } else {
        await repo.save(
          repo.create({
            activityId,
            name: item.name.trim(),
            value: item.value,
            note: this.normalizeNote(item.note),
            sortOrder: item.sortOrder ?? index,
          }),
        );
      }
    }
  }

  private async replaceMaterials(
    repo: Repository<ActivityMaterial>,
    activityId: string,
    materials: UpsertActivityMaterialDto[],
  ): Promise<void> {
    const existing = await repo.find({ where: { activityId } });
    const incomingIds = materials
      .map((material) => material.id)
      .filter((id): id is string => Boolean(id));

    for (const id of incomingIds) {
      if (!existing.some((material) => material.id === id)) {
        throw new BadRequestException(
          'Activity material does not belong to this activity',
        );
      }
    }

    const removed = existing.filter(
      (material) => !incomingIds.includes(material.id),
    );
    if (removed.length) {
      await repo.remove(removed);
    }

    for (const [index, material] of materials.entries()) {
      if (material.id) {
        const current = existing.find((row) => row.id === material.id);
        if (!current) {
          continue;
        }
        current.name = material.name.trim();
        current.startTime = normalizeTime(material.startTime);
        current.endTime = normalizeTime(material.endTime);
        current.sortOrder = material.sortOrder ?? index;
        await repo.save(current);
      } else {
        await repo.save(
          repo.create({
            activityId,
            name: material.name.trim(),
            startTime: normalizeTime(material.startTime),
            endTime: normalizeTime(material.endTime),
            sortOrder: material.sortOrder ?? index,
          }),
        );
      }
    }
  }

  private toResponse(
    activity: Activity,
    withBody: boolean,
  ): ActivityResponseDto {
    const response: ActivityResponseDto = {
      id: activity.id,
      activityType: this.activityTypesService.toResponse(activity.activityType),
      activityDate: activity.activityDate,
      companion: {
        id: activity.companion.id,
        name: activity.companion.name,
        role: activity.companion.role,
      },
      student: {
        id: activity.student.id,
        name: activity.student.name,
        nis: activity.student.nis,
        class: activity.student.className,
      },
      description: activity.description,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
    };

    if (withBody) {
      response.items = [...(activity.items ?? [])]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item): ActivityItemResponseDto => ({
          id: item.id,
          name: item.name,
          value: item.value,
          note: item.note ?? null,
          sortOrder: item.sortOrder,
        }));
      response.materials = [...(activity.materials ?? [])]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((material): ActivityMaterialResponseDto => ({
          id: material.id,
          name: material.name,
          startTime: material.startTime,
          endTime: material.endTime,
          timeRange: formatTimeRange(material.startTime, material.endTime),
          sortOrder: material.sortOrder,
        }));
    }

    return response;
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
          'An activity of this type already exists for this student on this date',
        );
      }
      if (driverError?.code === '23514') {
        throw new BadRequestException(
          'Material start and end time must be different',
        );
      }
    }
    throw error;
  }
}
