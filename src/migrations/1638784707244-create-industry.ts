import { MigrationInterface, QueryRunner } from 'typeorm'

export class createIndustry1638784707244 implements MigrationInterface {
  name = 'createIndustry1638784707244'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "industry" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(50) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "industry"`)
  }
}
