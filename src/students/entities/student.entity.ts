import { AbstractEntity } from '../../common/entities/abstract.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';

@Entity({ name: 'students' })
export class Student extends AbstractEntity {
  @Column({ type: 'varchar', length: 150 })
  @Index('IDX_students_name')
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  nis: string;

  @Column({ name: 'class_name', type: 'varchar', length: 50 })
  className: string;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => Activity, (activity) => activity.student)
  activities: Relation<Activity[]>;
}
