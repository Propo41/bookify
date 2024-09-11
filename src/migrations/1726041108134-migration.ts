import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726041108134 implements MigrationInterface {
    name = 'Migration1726041108134'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Auth" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "accessToken" text NOT NULL, "refreshToken" text, "scope" varchar NOT NULL, "idToken" text NOT NULL, "tokenType" varchar NOT NULL, "expiryDate" bigint NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "Users" ("id" varchar PRIMARY KEY NOT NULL, "authId" integer NOT NULL, "email" varchar NOT NULL, "name" varchar NOT NULL, "domain" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "REL_8832cd2dbd98b85067c5f2420b" UNIQUE ("authId"))`);
        await queryRunner.query(`CREATE TABLE "ConferenceRooms" ("id" varchar PRIMARY KEY NOT NULL, "domain" varchar NOT NULL, "name" varchar NOT NULL, "email" text NOT NULL, "seats" integer NOT NULL, "description" text, "floor" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_1fa5374f9e97d0826093b72d5da" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "temporary_Users" ("id" varchar PRIMARY KEY NOT NULL, "authId" integer NOT NULL, "email" varchar NOT NULL, "name" varchar NOT NULL, "domain" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "REL_8832cd2dbd98b85067c5f2420b" UNIQUE ("authId"), CONSTRAINT "FK_8832cd2dbd98b85067c5f2420ba" FOREIGN KEY ("authId") REFERENCES "Auth" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_Users"("id", "authId", "email", "name", "domain", "createdAt", "updatedAt") SELECT "id", "authId", "email", "name", "domain", "createdAt", "updatedAt" FROM "Users"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`ALTER TABLE "temporary_Users" RENAME TO "Users"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" RENAME TO "temporary_Users"`);
        await queryRunner.query(`CREATE TABLE "Users" ("id" varchar PRIMARY KEY NOT NULL, "authId" integer NOT NULL, "email" varchar NOT NULL, "name" varchar NOT NULL, "domain" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "REL_8832cd2dbd98b85067c5f2420b" UNIQUE ("authId"))`);
        await queryRunner.query(`INSERT INTO "Users"("id", "authId", "email", "name", "domain", "createdAt", "updatedAt") SELECT "id", "authId", "email", "name", "domain", "createdAt", "updatedAt" FROM "temporary_Users"`);
        await queryRunner.query(`DROP TABLE "temporary_Users"`);
        await queryRunner.query(`DROP TABLE "ConferenceRooms"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP TABLE "Auth"`);
    }

}
