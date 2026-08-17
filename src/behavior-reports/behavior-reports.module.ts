import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesModule } from '../activities/activities.module';
import { BehaviorCategoriesController } from './behavior-categories.controller';
import { BehaviorCategoriesService } from './behavior-categories.service';
import { BehaviorReportsController } from './behavior-reports.controller';
import { BehaviorReportsService } from './behavior-reports.service';
import { BehaviorCatalogItem } from './entities/behavior-catalog-item.entity';
import { BehaviorCategory } from './entities/behavior-category.entity';
import { BehaviorReport } from './entities/behavior-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BehaviorReport,
      BehaviorCategory,
      BehaviorCatalogItem,
    ]),
    ActivitiesModule,
  ],
  controllers: [BehaviorCategoriesController, BehaviorReportsController],
  providers: [BehaviorCategoriesService, BehaviorReportsService],
  exports: [BehaviorReportsService, BehaviorCategoriesService, TypeOrmModule],
})
export class BehaviorReportsModule {}
