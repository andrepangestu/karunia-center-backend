import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivitiesService } from '../activities/activities.service';
import { BehaviorCategoriesService } from './behavior-categories.service';
import { BehaviorReportResponseDto } from './dto/behavior-report-response.dto';
import { CreateBehaviorReportDto } from './dto/create-behavior-report.dto';
import { UpdateBehaviorReportDto } from './dto/update-behavior-report.dto';
import { BehaviorReport } from './entities/behavior-report.entity';

@Injectable()
export class BehaviorReportsService {
  constructor(
    @InjectRepository(BehaviorReport)
    private readonly reportsRepository: Repository<BehaviorReport>,
    private readonly activitiesService: ActivitiesService,
    private readonly behaviorCategoriesService: BehaviorCategoriesService,
  ) {}

  async findByActivity(
    activityId: string,
  ): Promise<BehaviorReportResponseDto[]> {
    await this.activitiesService.getEntityById(activityId, false);
    const reports = await this.reportsRepository.find({
      where: { activityId },
      order: { createdAt: 'ASC' },
    });
    return reports.map((report) => this.toResponse(report));
  }

  async create(
    activityId: string,
    dto: CreateBehaviorReportDto,
  ): Promise<BehaviorReportResponseDto> {
    await this.activitiesService.getEntityById(activityId, false);
    const catalogItem =
      await this.behaviorCategoriesService.getActiveCatalogItemById(
        dto.catalogItemId,
      );

    const duplicate = await this.reportsRepository.findOne({
      where: {
        activityId,
        behaviorType: catalogItem.category.name,
        behaviorName: catalogItem.name,
      },
    });
    if (duplicate) {
      throw new ConflictException(
        'This behavior is already reported for this activity',
      );
    }

    const saved = await this.reportsRepository.save(
      this.reportsRepository.create({
        activityId,
        behaviorType: catalogItem.category.name,
        behaviorName: catalogItem.name,
        score: dto.score,
        description: dto.description?.trim() ?? null,
      }),
    );

    return this.toResponse(saved);
  }

  async update(
    id: string,
    dto: UpdateBehaviorReportDto,
  ): Promise<BehaviorReportResponseDto> {
    const report = await this.getEntityById(id);

    if (dto.score !== undefined) {
      report.score = dto.score;
    }
    if (dto.description !== undefined) {
      report.description = dto.description?.trim() ?? null;
    }

    const saved = await this.reportsRepository.save(report);
    return this.toResponse(saved);
  }

  async remove(id: string): Promise<void> {
    const report = await this.getEntityById(id);
    await this.reportsRepository.remove(report);
  }

  private async getEntityById(id: string): Promise<BehaviorReport> {
    const report = await this.reportsRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException('Behavior report not found');
    }
    return report;
  }

  private toResponse(report: BehaviorReport): BehaviorReportResponseDto {
    return {
      id: report.id,
      activityId: report.activityId,
      behaviorType: report.behaviorType,
      behaviorName: report.behaviorName,
      score: report.score,
      description: report.description,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }
}
