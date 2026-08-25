import { MigrationInterface, QueryRunner } from 'typeorm';
import { seedFormHarianActivityTemplates } from '../seeds/form-harian-activity-templates.seed';

type SeedBehaviorCategory = {
  code: string;
  name: string;
  sortOrder: number;
  items: string[];
};

const BEHAVIOR_CATEGORIES: SeedBehaviorCategory[] = [
  {
    code: 'TANTRUM',
    name: 'Perilaku Tantrum',
    sortOrder: 0,
    items: ['Menjerit', 'Menangis', 'Melompat', 'Merengek', 'Berlari'],
  },
  {
    code: 'SELF_HARM',
    name: 'Perilaku Menyakiti Diri Sendiri',
    sortOrder: 1,
    items: [
      'Memukul atau Membenturkan Bagian Tubuh',
      'Menggaruk Hingga Luka',
      'Menggigit',
    ],
  },
  {
    code: 'AGGRESSIVE',
    name: 'Perilaku Agresif',
    sortOrder: 2,
    items: [
      'Melempar Bola/benda',
      'Menggigit Orang lain',
      'Memukul Orang Lain',
      'Menendang Orang Lain',
      'Mencubit Orang Lain',
      'Memeluk Orang Lain',
      'Mencakar Orang Lain',
    ],
  },
  {
    code: 'SELF_STIMULATION',
    name: 'Perilaku Stimulasi Diri',
    sortOrder: 3,
    items: [
      'Mengeluarkan Suara Aneh',
      'Berbicara Sendiri',
      'Menggigit Baju',
      'Meremas Tangan',
      'Membenturkan Tumit',
      'Memainkan Benda',
    ],
  },
];

export class FormHarianSupport20260818053000 implements MigrationInterface {
  name = 'FormHarianSupport20260818053000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_templates" DROP CONSTRAINT IF EXISTS "CHK_activity_templates_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_materials" DROP CONSTRAINT IF EXISTS "CHK_activity_materials_time"`,
    );

    await queryRunner.query(
      `ALTER TABLE "activity_items" ADD COLUMN "note" text`,
    );

    await queryRunner.query(`
      CREATE TABLE "behavior_categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" character varying(50) NOT NULL,
        "name" character varying(150) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_behavior_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_behavior_categories_code" UNIQUE ("code")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_behavior_categories_sort_order" ON "behavior_categories" ("sort_order")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_behavior_categories_is_active" ON "behavior_categories" ("is_active")`,
    );

    await queryRunner.query(`
      CREATE TABLE "behavior_catalog_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "category_id" uuid NOT NULL,
        "name" character varying(150) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_behavior_catalog_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_behavior_catalog_items_category" FOREIGN KEY ("category_id")
          REFERENCES "behavior_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_behavior_catalog_items_category_id" ON "behavior_catalog_items" ("category_id")`,
    );

    await seedFormHarianActivityTemplates(queryRunner);
    await this.seedBehaviorCatalog(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "behavior_catalog_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "behavior_categories"`);
    await queryRunner.query(
      `ALTER TABLE "activity_items" DROP COLUMN IF EXISTS "note"`,
    );
    await queryRunner.query(`
      ALTER TABLE "activity_templates"
      ADD CONSTRAINT "CHK_activity_templates_time" CHECK ("end_time" > "start_time")
    `);
    await queryRunner.query(`
      ALTER TABLE "activity_materials"
      ADD CONSTRAINT "CHK_activity_materials_time" CHECK ("end_time" > "start_time")
    `);
  }

  private async seedBehaviorCatalog(queryRunner: QueryRunner): Promise<void> {
    for (const category of BEHAVIOR_CATEGORIES) {
      await queryRunner.query(
        `
          INSERT INTO "behavior_categories" ("code", "name", "sort_order")
          VALUES ($1, $2, $3)
          ON CONFLICT ("code") DO NOTHING
        `,
        [category.code, category.name, category.sortOrder],
      );

      const rows = (await queryRunner.query(
        `SELECT "id" FROM "behavior_categories" WHERE "code" = $1`,
        [category.code],
      )) as Array<{ id: string }>;
      const categoryId = rows[0]?.id;
      if (!categoryId) {
        continue;
      }

      const itemCount = (await queryRunner.query(
        `SELECT COUNT(*)::int AS count FROM "behavior_catalog_items" WHERE "category_id" = $1`,
        [categoryId],
      )) as Array<{ count: number }>;
      if (itemCount[0]?.count > 0) {
        continue;
      }

      for (const [index, name] of category.items.entries()) {
        await queryRunner.query(
          `
            INSERT INTO "behavior_catalog_items" ("category_id", "name", "sort_order")
            VALUES ($1, $2, $3)
          `,
          [categoryId, name, index],
        );
      }
    }
  }
}
