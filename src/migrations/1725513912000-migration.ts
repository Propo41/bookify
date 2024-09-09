import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1725513912000 implements MigrationInterface {
    name = 'Migration1725513912000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_Auth" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "accessToken" text NOT NULL, "refreshToken" text NOT NULL, "scope" varchar NOT NULL, "idToken" text NOT NULL, "tokenType" varchar NOT NULL, "expiryDate" bigint NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "temporary_Auth"("id", "accessToken", "refreshToken", "scope", "idToken", "tokenType", "expiryDate", "createdAt", "updatedAt") SELECT "id", "accessToken", "refreshToken", "scope", "idToken", "tokenType", "expiryDate", "createdAt", "updatedAt" FROM "Auth"`);
        await queryRunner.query(`DROP TABLE "Auth"`);
        await queryRunner.query(`ALTER TABLE "temporary_Auth" RENAME TO "Auth"`);
        await queryRunner.query(`CREATE TABLE "temporary_Auth" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "accessToken" text NOT NULL, "refreshToken" text, "scope" varchar NOT NULL, "idToken" text NOT NULL, "tokenType" varchar NOT NULL, "expiryDate" bigint NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "temporary_Auth"("id", "accessToken", "refreshToken", "scope", "idToken", "tokenType", "expiryDate", "createdAt", "updatedAt") SELECT "id", "accessToken", "refreshToken", "scope", "idToken", "tokenType", "expiryDate", "createdAt", "updatedAt" FROM "Auth"`);
        await queryRunner.query(`DROP TABLE "Auth"`);
        await queryRunner.query(`ALTER TABLE "temporary_Auth" RENAME TO "Auth"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Auth" RENAME TO "temporary_Auth"`);
        await queryRunner.query(`CREATE TABLE "Auth" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "accessToken" text NOT NULL, "refreshToken" text NOT NULL, "scope" varchar NOT NULL, "idToken" text NOT NULL, "tokenType" varchar NOT NULL, "expiryDate" bigint NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "Auth"("id", "accessToken", "refreshToken", "scope", "idToken", "tokenType", "expiryDate", "createdAt", "updatedAt") SELECT "id", "accessToken", "refreshToken", "scope", "idToken", "tokenType", "expiryDate", "createdAt", "updatedAt" FROM "temporary_Auth"`);
        await queryRunner.query(`DROP TABLE "temporary_Auth"`);
        await queryRunner.query(`ALTER TABLE "Auth" RENAME TO "temporary_Auth"`);
        await queryRunner.query(`CREATE TABLE "Auth" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "accessToken" text NOT NULL, "refreshToken" text NOT NULL, "scope" varchar NOT NULL, "idToken" text NOT NULL, "tokenType" varchar NOT NULL, "expiryDate" bigint NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "Auth"("id", "accessToken", "refreshToken", "scope", "idToken", "tokenType", "expiryDate", "createdAt", "updatedAt") SELECT "id", "accessToken", "refreshToken", "scope", "idToken", "tokenType", "expiryDate", "createdAt", "updatedAt" FROM "temporary_Auth"`);
        await queryRunner.query(`DROP TABLE "temporary_Auth"`);
    }

}
