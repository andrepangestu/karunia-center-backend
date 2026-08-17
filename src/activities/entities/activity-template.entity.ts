import { AbstractEntity } from '../../common/entities/abstract.entity';
import { ActivityTemplateItem } from './activity-template-item.entity';
import { ActivityType } from './activity-type.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';

@Entity({ name: 'activity_templates' })
@Index('IDX_activity_templates_activity_type_id', ['activityTypeId'])
@Index('IDX_activity_templates_sort_order', ['sortOrder'])
export class ActivityTemplate extends AbstractEntity {
  @Column({ name: 'activity_type_id', type: 'uuid' })
  activityTypeId: string;

  @ManyToOne(() => ActivityType, (type) => type.templates, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'activity_type_id' })
  activityType: Relation<ActivityType>;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(() => ActivityTemplateItem, (item) => item.template, {
    cascade: ['insert', 'update'],
  })
  items: Relation<ActivityTemplateItem[]>;
}
