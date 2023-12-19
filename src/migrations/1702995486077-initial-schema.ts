import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1702995486077 implements MigrationInterface {
    name = 'InitialSchema1702995486077'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_eed66c93cca599b0db2f7646b79"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_188084d58df53ffc3aece22a329"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_b65c475f56d0e375ef192564266"`);
        await queryRunner.query(`CREATE TABLE "user_viewer" ("user_id" uuid NOT NULL, "viewer_id" uuid NOT NULL, CONSTRAINT "PK_8777ade0f805a1a1e13ec241646" PRIMARY KEY ("user_id", "viewer_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0607e0ae505416bc717b3da704" ON "user_viewer" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_62d0b082ba0b1b0a8d921a85ee" ON "user_viewer" ("viewer_id") `);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "viewerId"`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_188084d58df53ffc3aece22a329" FOREIGN KEY ("categoriesId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_b65c475f56d0e375ef192564266" FOREIGN KEY ("postsId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_viewer" ADD CONSTRAINT "FK_0607e0ae505416bc717b3da7049" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_viewer" ADD CONSTRAINT "FK_62d0b082ba0b1b0a8d921a85ee8" FOREIGN KEY ("viewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_viewer" DROP CONSTRAINT "FK_62d0b082ba0b1b0a8d921a85ee8"`);
        await queryRunner.query(`ALTER TABLE "user_viewer" DROP CONSTRAINT "FK_0607e0ae505416bc717b3da7049"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_b65c475f56d0e375ef192564266"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_188084d58df53ffc3aece22a329"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "viewerId" uuid`);
        await queryRunner.query(`DROP INDEX "public"."IDX_62d0b082ba0b1b0a8d921a85ee"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0607e0ae505416bc717b3da704"`);
        await queryRunner.query(`DROP TABLE "user_viewer"`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_b65c475f56d0e375ef192564266" FOREIGN KEY ("postsId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_188084d58df53ffc3aece22a329" FOREIGN KEY ("categoriesId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_eed66c93cca599b0db2f7646b79" FOREIGN KEY ("viewerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
