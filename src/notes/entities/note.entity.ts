import { AbstractEntity } from '../../common/entities/abstract.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';

@Entity({ name: 'notes' })
@Index('IDX_notes_activity_id', ['activityId'])
@Index('IDX_notes_created_by_id', ['createdById'])
export class Note extends AbstractEntity {
  @Column({ name: 'activity_id', type: 'uuid' })
  activityId: string;

  @ManyToOne(() => Activity, (activity) => activity.notes, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'activity_id' })
  activity: Relation<Activity>;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'created_by_id', type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User, (user) => user.notes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: Relation<User>;
}
