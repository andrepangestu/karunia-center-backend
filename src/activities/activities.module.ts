import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { ActivityItem } from './entities/activity-item.entity';
import { ActivityMaterial } from './entities/activity-material.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, ActivityItem, ActivityMaterial]),
  ],
  exports: [TypeOrmModule],
})
export class ActivitiesModule {}
