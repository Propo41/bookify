import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1725018592323 implements MigrationInterface {
    name = 'Migration1725018592323'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Auth\` DROP COLUMN \`idToken\``);
        await queryRunner.query(`ALTER TABLE \`Auth\` ADD \`idToken\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Auth\` DROP COLUMN \`idToken\``);
        await queryRunner.query(`ALTER TABLE \`Auth\` ADD \`idToken\` varchar(255) NOT NULL`);
    }

}
