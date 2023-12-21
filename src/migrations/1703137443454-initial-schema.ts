import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1703137443454 implements MigrationInterface {
    name = 'InitialSchema1703137443454'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_188084d58df53ffc3aece22a329"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_b65c475f56d0e375ef192564266"`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_b65c475f56d0e375ef192564266" FOREIGN KEY ("postsId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_188084d58df53ffc3aece22a329" FOREIGN KEY ("categoriesId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_188084d58df53ffc3aece22a329"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_b65c475f56d0e375ef192564266"`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_b65c475f56d0e375ef192564266" FOREIGN KEY ("postsId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_188084d58df53ffc3aece22a329" FOREIGN KEY ("categoriesId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
