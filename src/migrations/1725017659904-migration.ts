import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1725017659904 implements MigrationInterface {
    name = 'Migration1725017659904'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`Auth\` (\`id\` int NOT NULL AUTO_INCREMENT, \`accessToken\` text NOT NULL, \`scope\` varchar(255) NOT NULL, \`tokenType\` varchar(255) NOT NULL, \`expiryDate\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Users\` (\`id\` varchar(255) NOT NULL, \`authId\` int NOT NULL, \`email\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`REL_8832cd2dbd98b85067c5f2420b\` (\`authId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Users\` ADD CONSTRAINT \`FK_8832cd2dbd98b85067c5f2420ba\` FOREIGN KEY (\`authId\`) REFERENCES \`Auth\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Users\` DROP FOREIGN KEY \`FK_8832cd2dbd98b85067c5f2420ba\``);
        await queryRunner.query(`DROP INDEX \`REL_8832cd2dbd98b85067c5f2420b\` ON \`Users\``);
        await queryRunner.query(`DROP TABLE \`Users\``);
        await queryRunner.query(`DROP TABLE \`Auth\``);
    }

}
