import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1725037292656 implements MigrationInterface {
    name = 'Migration1725037292656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Auth\` ADD \`refreshToken\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Auth\` DROP COLUMN \`refreshToken\``);
    }

}
