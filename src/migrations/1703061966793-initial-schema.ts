import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1703061966793 implements MigrationInterface {
    name = 'InitialSchema1703061966793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "description" character varying NOT NULL, "postId" uuid, "userId" uuid, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "value" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "refreshToken" character varying NOT NULL, "userId" character varying NOT NULL, CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "firstname" character varying NOT NULL, "lastname" character varying NOT NULL, "email" character varying NOT NULL, "profilPhoto" character varying, "password" character varying NOT NULL, "isBlocked" boolean NOT NULL DEFAULT false, "isActivated" boolean NOT NULL DEFAULT false, "activationCode" character varying, "activationCodeExpires" TIMESTAMP WITH TIME ZONE, "passwordChangedAt" TIMESTAMP WITH TIME ZONE, "passwordResetToken" character varying, "passwordResetExpires" TIMESTAMP WITH TIME ZONE, "lastPostDate" character varying, "userAward" "public"."users_useraward_enum" NOT NULL DEFAULT 'bronze', "roleId" uuid, "tokenId" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "REL_d98a275f8bc6cd986fcbe2eab0" UNIQUE ("tokenId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "description" character varying NOT NULL, "image" character varying NOT NULL, "userId" uuid, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_viewer" ("userId" uuid NOT NULL, "viewerId" uuid NOT NULL, CONSTRAINT "PK_d09cd3e659f4712c88bd59017a1" PRIMARY KEY ("userId", "viewerId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5afec815e0d87dc1e0c196d947" ON "user_viewer" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b9dc9183c86849935959001b93" ON "user_viewer" ("viewerId") `);
        await queryRunner.query(`CREATE TABLE "user_followers" ("userId" uuid NOT NULL, "followerId" uuid NOT NULL, CONSTRAINT "PK_2ef3f0032f555df18ddc38c4552" PRIMARY KEY ("userId", "followerId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_347ce7a07457528a1779da8b8f" ON "user_followers" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c3f56a3157b50bc8adcc6acf27" ON "user_followers" ("followerId") `);
        await queryRunner.query(`CREATE TABLE "user_followings" ("userId" uuid NOT NULL, "followingId" uuid NOT NULL, CONSTRAINT "PK_0918f2a7a6d674f5915ad628c27" PRIMARY KEY ("userId", "followingId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fd0d9ded15ad5b0ce7c9f796b9" ON "user_followings" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_71668c35cf96a75830cf04ea11" ON "user_followings" ("followingId") `);
        await queryRunner.query(`CREATE TABLE "user_blockings" ("userId" uuid NOT NULL, "blockingId" uuid NOT NULL, CONSTRAINT "PK_53e65f2b805ebd1334b5bda5c36" PRIMARY KEY ("userId", "blockingId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1641cb598916b070ab53eef7c2" ON "user_blockings" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_496915ebaf7e4df23cfee937aa" ON "user_blockings" ("blockingId") `);
        await queryRunner.query(`CREATE TABLE "post_categories" ("postsId" uuid NOT NULL, "categoriesId" uuid NOT NULL, CONSTRAINT "PK_d8423d17c5530cde6985e405370" PRIMARY KEY ("postsId", "categoriesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b65c475f56d0e375ef19256426" ON "post_categories" ("postsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_188084d58df53ffc3aece22a32" ON "post_categories" ("categoriesId") `);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_368e146b785b574f42ae9e53d5e" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_d98a275f8bc6cd986fcbe2eab01" FOREIGN KEY ("tokenId") REFERENCES "tokens"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_ae05faaa55c866130abef6e1fee" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_viewer" ADD CONSTRAINT "FK_5afec815e0d87dc1e0c196d9474" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_viewer" ADD CONSTRAINT "FK_b9dc9183c86849935959001b93a" FOREIGN KEY ("viewerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_followers" ADD CONSTRAINT "FK_347ce7a07457528a1779da8b8f3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_followers" ADD CONSTRAINT "FK_c3f56a3157b50bc8adcc6acf278" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_followings" ADD CONSTRAINT "FK_fd0d9ded15ad5b0ce7c9f796b9f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_followings" ADD CONSTRAINT "FK_71668c35cf96a75830cf04ea119" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_blockings" ADD CONSTRAINT "FK_1641cb598916b070ab53eef7c2c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_blockings" ADD CONSTRAINT "FK_496915ebaf7e4df23cfee937aa4" FOREIGN KEY ("blockingId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_b65c475f56d0e375ef192564266" FOREIGN KEY ("postsId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_188084d58df53ffc3aece22a329" FOREIGN KEY ("categoriesId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_188084d58df53ffc3aece22a329"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_b65c475f56d0e375ef192564266"`);
        await queryRunner.query(`ALTER TABLE "user_blockings" DROP CONSTRAINT "FK_496915ebaf7e4df23cfee937aa4"`);
        await queryRunner.query(`ALTER TABLE "user_blockings" DROP CONSTRAINT "FK_1641cb598916b070ab53eef7c2c"`);
        await queryRunner.query(`ALTER TABLE "user_followings" DROP CONSTRAINT "FK_71668c35cf96a75830cf04ea119"`);
        await queryRunner.query(`ALTER TABLE "user_followings" DROP CONSTRAINT "FK_fd0d9ded15ad5b0ce7c9f796b9f"`);
        await queryRunner.query(`ALTER TABLE "user_followers" DROP CONSTRAINT "FK_c3f56a3157b50bc8adcc6acf278"`);
        await queryRunner.query(`ALTER TABLE "user_followers" DROP CONSTRAINT "FK_347ce7a07457528a1779da8b8f3"`);
        await queryRunner.query(`ALTER TABLE "user_viewer" DROP CONSTRAINT "FK_b9dc9183c86849935959001b93a"`);
        await queryRunner.query(`ALTER TABLE "user_viewer" DROP CONSTRAINT "FK_5afec815e0d87dc1e0c196d9474"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_ae05faaa55c866130abef6e1fee"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_d98a275f8bc6cd986fcbe2eab01"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_368e146b785b574f42ae9e53d5e"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_188084d58df53ffc3aece22a32"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b65c475f56d0e375ef19256426"`);
        await queryRunner.query(`DROP TABLE "post_categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_496915ebaf7e4df23cfee937aa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1641cb598916b070ab53eef7c2"`);
        await queryRunner.query(`DROP TABLE "user_blockings"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_71668c35cf96a75830cf04ea11"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fd0d9ded15ad5b0ce7c9f796b9"`);
        await queryRunner.query(`DROP TABLE "user_followings"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c3f56a3157b50bc8adcc6acf27"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_347ce7a07457528a1779da8b8f"`);
        await queryRunner.query(`DROP TABLE "user_followers"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b9dc9183c86849935959001b93"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5afec815e0d87dc1e0c196d947"`);
        await queryRunner.query(`DROP TABLE "user_viewer"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "tokens"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "comments"`);
    }

}
