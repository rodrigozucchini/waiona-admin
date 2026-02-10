import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarUrlToPersons1769550000000 implements MigrationInterface {
  name = 'AddAvatarUrlToPersons1769550000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "persons" ADD "avatarUrl" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "persons" DROP COLUMN "avatarUrl"`);
  }
}
