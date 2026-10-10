import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthTokens1791652108034 implements MigrationInterface {
    name = 'CreateAuthTokens1791652108034'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "auth_tokens" ("deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "jti" character varying NOT NULL, "type" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "user_id" character varying NOT NULL, CONSTRAINT "PK_41e9ddfbb32da18c4e85e45c2fd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f27412c432bf97e807837fcc02" ON "auth_tokens"  ("jti") `);
        await queryRunner.query(`CREATE INDEX "IDX_9691367d446cd8b18f462c191b" ON "auth_tokens"  ("user_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_9691367d446cd8b18f462c191b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f27412c432bf97e807837fcc02"`);
        await queryRunner.query(`DROP TABLE "auth_tokens"`);
    }

}
