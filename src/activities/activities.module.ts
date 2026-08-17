import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsModule } from '../students/students.module';
import { UsersModule } from '../users/users.module';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Activity } from './entities/activity.entity';
import { ActivityItem } from './entities/activity-item.entity';
import { ActivityMaterial } from './entities/activity-material.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, ActivityItem, ActivityMaterial]),
    UsersModule,
    StudentsModule,
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService, TypeOrmModule],
})
export class ActivitiesModule {}
