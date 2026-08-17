import { AbstractEntity } from '../../common/entities/abstract.entity';
import { Activity } from './activity.entity';
import { ActivityTemplate } from './activity-template.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';

@Entity({ name: 'activity_types' })
@Index('IDX_activity_types_sort_order', ['sortOrder'])
@Index('IDX_activity_types_is_active', ['isActive'])
export class ActivityType extends AbstractEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Activity, (activity) => activity.activityType)
  activities: Relation<Activity[]>;

  @OneToMany(() => ActivityTemplate, (template) => template.activityType)
  templates: Relation<ActivityTemplate[]>;
}
