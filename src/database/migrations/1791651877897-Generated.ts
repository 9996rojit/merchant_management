import { MigrationInterface, QueryRunner } from "typeorm";

export class Generated1791651877897 implements MigrationInterface {
    name = 'Generated1791651877897'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "merchant_applications" DROP CONSTRAINT "FK_merchant_applications_created_by"`);
        await queryRunner.query(`ALTER TABLE "merchant_applications" DROP CONSTRAINT "FK_merchant_applications_assigned_reviewer"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_actor_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_application_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_merchant_applications_business_status_risk"`);
        await queryRunner.query(`CREATE INDEX "IDX_2dc33f7f3c22e2e7badafca1d1" ON "audit_logs"  ("actorId") `);
        await queryRunner.query(`CREATE INDEX "IDX_511704c0a294b2869579eb68eb" ON "audit_logs"  ("merchantApplicationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_cc9f6f99bbd2cf86ea93262b1c" ON "merchant_applications"  ("business_name", "status", "risk_status") `);
        await queryRunner.query(`ALTER TABLE "merchant_applications" ADD CONSTRAINT "FK_2da4df0ec53929a13cb78d8496a" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "merchant_applications" ADD CONSTRAINT "FK_7da78a3bb9e76995dba067b83ed" FOREIGN KEY ("assigned_reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "merchant_applications" DROP CONSTRAINT "FK_7da78a3bb9e76995dba067b83ed"`);
        await queryRunner.query(`ALTER TABLE "merchant_applications" DROP CONSTRAINT "FK_2da4df0ec53929a13cb78d8496a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cc9f6f99bbd2cf86ea93262b1c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_511704c0a294b2869579eb68eb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2dc33f7f3c22e2e7badafca1d1"`);
        await queryRunner.query(`CREATE INDEX "IDX_merchant_applications_business_status_risk" ON "merchant_applications" USING btree ("business_name", "status", "risk_status") `);
        await queryRunner.query(`CREATE INDEX "IDX_audit_logs_application_id" ON "audit_logs" USING btree ("merchantApplicationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_audit_logs_actor_id" ON "audit_logs" USING btree ("actorId") `);
        await queryRunner.query(`ALTER TABLE "merchant_applications" ADD CONSTRAINT "FK_merchant_applications_assigned_reviewer" FOREIGN KEY ("assigned_reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "merchant_applications" ADD CONSTRAINT "FK_merchant_applications_created_by" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
