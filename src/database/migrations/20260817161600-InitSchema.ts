import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema20260817161600 implements MigrationInterface {
  name = 'InitSchema20260817161600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(
      `CREATE TYPE "user_role" AS ENUM ('ADMIN', 'PENDAMPING')`,
    );
    await queryRunner.query(
      `CREATE TYPE "activity_type" AS ENUM ('PAGI', 'SIANG', 'MALAM')`,
    );
    await queryRunner.query(
      `CREATE TYPE "activity_item_value" AS ENUM ('P', 'P+', 'A-', 'A')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(150) NOT NULL,
        "email" character varying(255) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "role" "user_role" NOT NULL,
        "address" text,
        "description" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_users_name" ON "users" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_role" ON "users" ("role")`,
    );

    await queryRunner.query(`
      CREATE TABLE "students" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(150) NOT NULL,
        "nis" character varying(50) NOT NULL,
        "class_name" character varying(50) NOT NULL,
        "address" text,
        "description" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_students" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_students_nis" UNIQUE ("nis")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_students_name" ON "students" ("name")`,
    );

    await queryRunner.query(`
      CREATE TABLE "activities" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "activity_type" "activity_type" NOT NULL,
        "activity_date" date NOT NULL,
        "companion_id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "description" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_activities" PRIMARY KEY ("id"),
        CONSTRAINT "FK_activities_companion" FOREIGN KEY ("companion_id")
          REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "FK_activities_student" FOREIGN KEY ("student_id")
          REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_activity_date" ON "activities" ("activity_date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_activity_type" ON "activities" ("activity_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_student_id" ON "activities" ("student_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_companion_id" ON "activities" ("companion_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_deleted_at" ON "activities" ("deleted_at")`,
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_activities_student_date_type_active"
      ON "activities" ("student_id", "activity_date", "activity_type")
      WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "activity_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "activity_id" uuid NOT NULL,
        "name" character varying(150) NOT NULL,
        "value" "activity_item_value" NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activity_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_activity_items_activity" FOREIGN KEY ("activity_id")
          REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_items_activity_id" ON "activity_items" ("activity_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "activity_materials" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "activity_id" uuid NOT NULL,
        "start_time" time NOT NULL,
        "end_time" time NOT NULL,
        "name" character varying(150) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activity_materials" PRIMARY KEY ("id"),
        CONSTRAINT "FK_activity_materials_activity" FOREIGN KEY ("activity_id")
          REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "CHK_activity_materials_time" CHECK ("end_time" > "start_time")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_activity_materials_activity_id" ON "activity_materials" ("activity_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "behavior_reports" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "activity_id" uuid NOT NULL,
        "behavior_type" character varying(100) NOT NULL,
        "behavior_name" character varying(150) NOT NULL,
        "score" smallint NOT NULL,
        "description" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_behavior_reports" PRIMARY KEY ("id"),
        CONSTRAINT "FK_behavior_reports_activity" FOREIGN KEY ("activity_id")
          REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "CHK_behavior_reports_score" CHECK ("score" IN (1, 2, 3))
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_behavior_reports_activity_id" ON "behavior_reports" ("activity_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "notes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "activity_id" uuid NOT NULL,
        "content" text NOT NULL,
        "created_by_id" uuid NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notes_activity" FOREIGN KEY ("activity_id")
          REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "FK_notes_created_by" FOREIGN KEY ("created_by_id")
          REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_notes_activity_id" ON "notes" ("activity_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notes_created_by_id" ON "notes" ("created_by_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "behavior_reports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_materials"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "activities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "students"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "activity_item_value"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "activity_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role"`);
  }
}
