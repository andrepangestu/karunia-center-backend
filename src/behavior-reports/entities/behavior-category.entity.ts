import { AbstractEntity } from '../../common/entities/abstract.entity';
import { BehaviorCatalogItem } from './behavior-catalog-item.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';

@Entity({ name: 'behavior_categories' })
@Index('IDX_behavior_categories_sort_order', ['sortOrder'])
@Index('IDX_behavior_categories_is_active', ['isActive'])
export class BehaviorCategory extends AbstractEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => BehaviorCatalogItem, (item) => item.category, {
    cascade: ['insert', 'update'],
  })
  items: Relation<BehaviorCatalogItem[]>;
}
