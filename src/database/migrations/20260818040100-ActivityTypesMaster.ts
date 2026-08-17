import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActivityTypesMaster20260818040100 implements MigrationInterface {
  name = 'ActivityTypesMaster20260818040100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "activity_types" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" character varying(50) NOT NULL,
        "name" character varying(150) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activity_types" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_activity_types_code" UNIQUE ("code")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_types_sort_order" ON "activity_types" ("sort_order")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_types_is_active" ON "activity_types" ("is_active")`,
    );

    await queryRunner.query(`
      INSERT INTO "activity_types" ("code", "name", "sort_order")
      VALUES
        ('PAGI', 'Pagi', 0),
        ('SIANG', 'Siang', 1),
        ('MALAM', 'Malam', 2)
    `);

    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN "activity_type_id" uuid`,
    );
    await queryRunner.query(`
      UPDATE "activities" AS activity
      SET "activity_type_id" = activity_type.id
      FROM "activity_types" AS activity_type
      WHERE activity."activity_type"::text = activity_type.code
    `);
    await queryRunner.query(
      `ALTER TABLE "activities" ALTER COLUMN "activity_type_id" SET NOT NULL`,
    );
    await queryRunner.query(`
      ALTER TABLE "activities"
      ADD CONSTRAINT "FK_activities_activity_type"
      FOREIGN KEY ("activity_type_id")
      REFERENCES "activity_types"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_activities_student_date_type_active"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_activities_activity_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" DROP COLUMN "activity_type"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_activity_type_id" ON "activities" ("activity_type_id")`,
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_activities_student_date_type_active"
      ON "activities" ("student_id", "activity_date", "activity_type_id")
      WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(
      `ALTER TABLE "activity_templates" ADD COLUMN "activity_type_id" uuid`,
    );
    await queryRunner.query(`
      UPDATE "activity_templates" AS template
      SET "activity_type_id" = activity_type.id
      FROM "activity_types" AS activity_type
      WHERE template."activity_type"::text = activity_type.code
    `);
    await queryRunner.query(
      `ALTER TABLE "activity_templates" ALTER COLUMN "activity_type_id" SET NOT NULL`,
    );
    await queryRunner.query(`
      ALTER TABLE "activity_templates"
      ADD CONSTRAINT "FK_activity_templates_activity_type"
      FOREIGN KEY ("activity_type_id")
      REFERENCES "activity_types"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_activity_templates_activity_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_templates" DROP COLUMN "activity_type"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_templates_activity_type_id" ON "activity_templates" ("activity_type_id")`,
    );

    await queryRunner.query(`DROP TYPE IF EXISTS "activity_type"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "activity_type" AS ENUM ('PAGI', 'SIANG', 'MALAM')`,
    );

    await queryRunner.query(
      `ALTER TABLE "activity_templates" ADD COLUMN "activity_type" "activity_type"`,
    );
    await queryRunner.query(`
      UPDATE "activity_templates" AS template
      SET "activity_type" = activity_type.code::"activity_type"
      FROM "activity_types" AS activity_type
      WHERE template."activity_type_id" = activity_type.id
    `);
    await queryRunner.query(
      `ALTER TABLE "activity_templates" ALTER COLUMN "activity_type" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_templates" DROP CONSTRAINT "FK_activity_templates_activity_type"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_activity_templates_activity_type_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_templates" DROP COLUMN "activity_type_id"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_templates_activity_type" ON "activity_templates" ("activity_type")`,
    );

    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN "activity_type" "activity_type"`,
    );
    await queryRunner.query(`
      UPDATE "activities" AS activity
      SET "activity_type" = activity_type.code::"activity_type"
      FROM "activity_types" AS activity_type
      WHERE activity."activity_type_id" = activity_type.id
    `);
    await queryRunner.query(
      `ALTER TABLE "activities" ALTER COLUMN "activity_type" SET NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_activities_student_date_type_active"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_activities_activity_type_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" DROP CONSTRAINT "FK_activities_activity_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" DROP COLUMN "activity_type_id"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_activity_type" ON "activities" ("activity_type")`,
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_activities_student_date_type_active"
      ON "activities" ("student_id", "activity_date", "activity_type")
      WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "activity_types"`);
  }
}
