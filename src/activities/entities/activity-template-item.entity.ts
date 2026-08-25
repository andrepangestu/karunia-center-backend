import { AbstractEntity } from '../../common/entities/abstract.entity';
import { ActivityTemplate } from './activity-template.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';

@Entity({ name: 'activity_template_items' })
@Index('IDX_activity_template_items_template_id', ['templateId'])
export class ActivityTemplateItem extends AbstractEntity {
  @Column({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @ManyToOne(() => ActivityTemplate, (template) => template.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'template_id' })
  template: Relation<ActivityTemplate>;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}
