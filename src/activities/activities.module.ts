import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsModule } from '../students/students.module';
import { UsersModule } from '../users/users.module';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivityTemplatesController } from './activity-templates.controller';
import { ActivityTemplatesService } from './activity-templates.service';
import { ActivityTypesController } from './activity-types.controller';
import { ActivityTypesService } from './activity-types.service';
import { Activity } from './entities/activity.entity';
import { ActivityItem } from './entities/activity-item.entity';
import { ActivityMaterial } from './entities/activity-material.entity';
import { ActivityTemplate } from './entities/activity-template.entity';
import { ActivityTemplateItem } from './entities/activity-template-item.entity';
import { ActivityType } from './entities/activity-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activity,
      ActivityItem,
      ActivityMaterial,
      ActivityTemplate,
      ActivityTemplateItem,
      ActivityType,
    ]),
    UsersModule,
    StudentsModule,
  ],
  controllers: [
    ActivityTypesController,
    ActivityTemplatesController,
    ActivitiesController,
  ],
  providers: [
    ActivityTypesService,
    ActivitiesService,
    ActivityTemplatesService,
  ],
  exports: [
    ActivitiesService,
    ActivityTemplatesService,
    ActivityTypesService,
    TypeOrmModule,
  ],
})
export class ActivitiesModule {}
