import { AbstractEntity } from '../../common/entities/abstract.entity';
import { BehaviorCategory } from './behavior-category.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';

@Entity({ name: 'behavior_catalog_items' })
@Index('IDX_behavior_catalog_items_category_id', ['categoryId'])
export class BehaviorCatalogItem extends AbstractEntity {
  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => BehaviorCategory, (category) => category.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Relation<BehaviorCategory>;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}
