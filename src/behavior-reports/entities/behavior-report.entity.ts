import { AbstractEntity } from '../../common/entities/abstract.entity';
import { BehaviorScore } from '../../common/enums/behavior-score.enum';
import { Activity } from '../../activities/entities/activity.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';

@Entity({ name: 'behavior_reports' })
@Index('IDX_behavior_reports_activity_id', ['activityId'])
export class BehaviorReport extends AbstractEntity {
  @Column({ name: 'activity_id', type: 'uuid' })
  activityId: string;

  @ManyToOne(() => Activity, (activity) => activity.behaviorReports, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'activity_id' })
  activity: Relation<Activity>;

  @Column({ name: 'behavior_type', type: 'varchar', length: 100 })
  behaviorType: string;

  @Column({ name: 'behavior_name', type: 'varchar', length: 150 })
  behaviorName: string;

  @Column({ type: 'smallint' })
  score: BehaviorScore;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
