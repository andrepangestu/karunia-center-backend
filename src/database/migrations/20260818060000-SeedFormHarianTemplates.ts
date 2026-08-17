import { MigrationInterface, QueryRunner } from 'typeorm';
import { seedFormHarianActivityTemplates } from '../seeds/form-harian-activity-templates.seed';

export class SeedFormHarianTemplates20260818060000
  implements MigrationInterface
{
  name = 'SeedFormHarianTemplates20260818060000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await seedFormHarianActivityTemplates(queryRunner);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Seed data is retained on revert; templates may already be referenced.
  }
}
