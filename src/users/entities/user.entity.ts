import { UserRole } from '../../common/enums/user-role.enum';
import { AbstractEntity } from '../../common/entities/abstract.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { Note } from '../../notes/entities/note.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';

@Entity({ name: 'users' })
export class User extends AbstractEntity {
  @Column({ type: 'varchar', length: 150 })
  @Index('IDX_users_name')
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    select: false,
  })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, enumName: 'user_role' })
  @Index('IDX_users_role')
  role: UserRole;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => Activity, (activity) => activity.companion)
  activities: Relation<Activity[]>;

  @OneToMany(() => Note, (note) => note.createdBy)
  notes: Relation<Note[]>;
}
