import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMerchantManagement1791590400000 implements MigrationInterface {
    name = 'InitialMerchantManagement1791590400000';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        "email" varchar NOT NULL,
        "password" varchar NOT NULL,
        "role" varchar NOT NULL,
        "salt" varchar NOT NULL,
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "merchant_applications" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        "business_name" varchar NOT NULL,
        "legal_business_name" varchar NOT NULL,
        "business_type" varchar NOT NULL,
        "owner_name" varchar NOT NULL,
        "owner_email" varchar NOT NULL,
        "owner_contact_number" varchar NOT NULL,
        "requestedProcessingInfo" jsonb,
        "status" varchar NOT NULL,
        "risk_detail" varchar,
        "risk_status" varchar NOT NULL DEFAULT 'PENDING',
        "created_by_id" uuid NOT NULL,
        "assigned_reviewer_id" uuid,
        CONSTRAINT "PK_merchant_applications_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_merchant_applications_created_by" FOREIGN KEY ("created_by_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_merchant_applications_assigned_reviewer" FOREIGN KEY ("assigned_reviewer_id")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_merchant_applications_business_status_risk"
      ON "merchant_applications" ("business_name", "status", "risk_status")
    `);
        await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        "actorId" uuid NOT NULL,
        "action" varchar(100) NOT NULL,
        "merchantApplicationId" uuid,
        "metadata" jsonb,
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_audit_logs_actor_id" ON "audit_logs" ("actorId")`);
        await queryRunner.query(`CREATE INDEX "IDX_audit_logs_application_id" ON "audit_logs" ("merchantApplicationId")`);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "merchant_applications"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}