import { AbstractEntity } from '../../common/entities/abstract.entity';
import { User } from '../../users/entities/user.entity';
import { Student } from '../../students/entities/student.entity';
import { ActivityItem } from './activity-item.entity';
import { ActivityMaterial } from './activity-material.entity';
import { ActivityType } from './activity-type.entity';
import { BehaviorReport } from '../../behavior-reports/entities/behavior-report.entity';
import { Note } from '../../notes/entities/note.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';

@Entity({ name: 'activities' })
@Index('IDX_activities_activity_date', ['activityDate'])
@Index('IDX_activities_activity_type_id', ['activityTypeId'])
@Index('IDX_activities_student_id', ['studentId'])
@Index('IDX_activities_companion_id', ['companionId'])
@Index('IDX_activities_deleted_at', ['deletedAt'])
@Index(
  'UQ_activities_student_date_type_active',
  ['studentId', 'activityDate', 'activityTypeId'],
  { unique: true, where: '"deleted_at" IS NULL' },
)
export class Activity extends AbstractEntity {
  @Column({ name: 'activity_type_id', type: 'uuid' })
  activityTypeId: string;

  @ManyToOne(() => ActivityType, (type) => type.activities, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'activity_type_id' })
  activityType: Relation<ActivityType>;

  @Column({ name: 'activity_date', type: 'date' })
  activityDate: string;

  @Column({ name: 'companion_id', type: 'uuid' })
  companionId: string;

  @ManyToOne(() => User, (user) => user.activities, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companion_id' })
  companion: Relation<User>;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, (student) => student.activities, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'student_id' })
  student: Relation<Student>;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => ActivityItem, (item) => item.activity, {
    cascade: ['insert', 'update'],
  })
  items: Relation<ActivityItem[]>;

  @OneToMany(() => ActivityMaterial, (material) => material.activity, {
    cascade: ['insert', 'update'],
  })
  materials: Relation<ActivityMaterial[]>;

  @OneToMany(() => BehaviorReport, (report) => report.activity)
  behaviorReports: Relation<BehaviorReport[]>;

  @OneToMany(() => Note, (note) => note.activity)
  notes: Relation<Note[]>;
}
