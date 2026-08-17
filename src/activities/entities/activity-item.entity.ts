import { AbstractEntity } from '../../common/entities/abstract.entity';
import { ActivityItemValue } from '../../common/enums/activity-item-value.enum';
import { Activity } from './activity.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';

@Entity({ name: 'activity_items' })
@Index('IDX_activity_items_activity_id', ['activityId'])
export class ActivityItem extends AbstractEntity {
  @Column({ name: 'activity_id', type: 'uuid' })
  activityId: string;

  @ManyToOne(() => Activity, (activity) => activity.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'activity_id' })
  activity: Relation<Activity>;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({
    type: 'enum',
    enum: ActivityItemValue,
    enumName: 'activity_item_value',
  })
  value: ActivityItemValue;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}
