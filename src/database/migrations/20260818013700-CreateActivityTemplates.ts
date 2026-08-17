import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivityTemplates20260818013700 implements MigrationInterface {
  name = 'CreateActivityTemplates20260818013700';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "activity_templates" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "activity_type" "activity_type" NOT NULL,
        "name" character varying(150) NOT NULL,
        "start_time" time NOT NULL,
        "end_time" time NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activity_templates" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_activity_templates_time" CHECK ("end_time" > "start_time")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_templates_activity_type" ON "activity_templates" ("activity_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_templates_sort_order" ON "activity_templates" ("sort_order")`,
    );

    await queryRunner.query(`
      CREATE TABLE "activity_template_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "template_id" uuid NOT NULL,
        "name" character varying(150) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activity_template_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_activity_template_items_template" FOREIGN KEY ("template_id")
          REFERENCES "activity_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_template_items_template_id" ON "activity_template_items" ("template_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_template_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_templates"`);
  }
}
