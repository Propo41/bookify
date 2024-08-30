import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1725018320627 implements MigrationInterface {
    name = 'Migration1725018320627'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Auth\` ADD \`idToken\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`Auth\` DROP COLUMN \`expiryDate\``);
        await queryRunner.query(`ALTER TABLE \`Auth\` ADD \`expiryDate\` bigint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Auth\` DROP COLUMN \`expiryDate\``);
        await queryRunner.query(`ALTER TABLE \`Auth\` ADD \`expiryDate\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`Auth\` DROP COLUMN \`idToken\``);
    }

}
