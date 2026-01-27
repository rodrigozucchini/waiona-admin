import { MigrationInterface, QueryRunner } from "typeorm";

export class Addcategories1769481999697 implements MigrationInterface {
    name = 'Addcategories1769481999697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_177da965b166453029d5fc488a"`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "name" character varying(100) NOT NULL, "description" character varying(255), "isActive" boolean NOT NULL DEFAULT true, "parent_id" integer, CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8b0be371d28245da6e4f4b6187" ON "categories" ("name") `);
        await queryRunner.query(`CREATE TABLE "stocks" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "quantity" integer NOT NULL DEFAULT '0', "productId" integer NOT NULL, CONSTRAINT "REL_3024bbca6232c8b6efa3ff5102" UNIQUE ("productId"), CONSTRAINT "PK_b5b1ee4ac914767229337974575" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stock_parameters" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "minStock" integer NOT NULL DEFAULT '0', "maxStock" integer, "criticalStock" integer NOT NULL DEFAULT '0', "allowNegativeStock" boolean NOT NULL DEFAULT false, "productId" integer NOT NULL, CONSTRAINT "REL_9c4f048b91dd13af93aad2e595" UNIQUE ("productId"), CONSTRAINT "PK_0a3e4287f5179b10dbf09339c8c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."stock_movements_type_enum" AS ENUM('IN', 'OUT', 'ADJUSTMENT')`);
        await queryRunner.query(`CREATE TABLE "stock_movements" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "quantity" integer NOT NULL, "type" "public"."stock_movements_type_enum" NOT NULL, "note" character varying, "productId" integer NOT NULL, CONSTRAINT "PK_57a26b190618550d8e65fb860e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."stock_losses_reason_enum" AS ENUM('DAMAGE', 'EXPIRED', 'THEFT', 'LOST')`);
        await queryRunner.query(`CREATE TABLE "stock_losses" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "quantity" integer NOT NULL, "reason" "public"."stock_losses_reason_enum" NOT NULL, "description" character varying(255), "productId" integer NOT NULL, CONSTRAINT "PK_9d0a9dfdb053f2dba4718a5dd20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "margins" ADD "isPercentage" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`CREATE TYPE "public"."products_measureunit_enum" AS ENUM('kg', 'g', 'mg', 'l', 'ml', 'cm3', 'unit')`);
        await queryRunner.query(`ALTER TABLE "products" ADD "measureUnit" "public"."products_measureunit_enum"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "measureValue" numeric(10,3)`);
        await queryRunner.query(`ALTER TABLE "products" ADD "category_id" integer`);
        await queryRunner.query(`ALTER TABLE "margins" ALTER COLUMN "value" TYPE numeric(10,2)`);
        await queryRunner.query(`CREATE INDEX "IDX_db6f3ad318303f4ed559dad4ec" ON "margins" ("isPercentage") `);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_88cea2dc9c31951d06437879b40" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stocks" ADD CONSTRAINT "FK_3024bbca6232c8b6efa3ff51028" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_parameters" ADD CONSTRAINT "FK_9c4f048b91dd13af93aad2e5958" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_a3acb59db67e977be45e382fc56" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_losses" ADD CONSTRAINT "FK_cc7708e22ed224877b5a5b06edb" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stock_losses" DROP CONSTRAINT "FK_cc7708e22ed224877b5a5b06edb"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_a3acb59db67e977be45e382fc56"`);
        await queryRunner.query(`ALTER TABLE "stock_parameters" DROP CONSTRAINT "FK_9c4f048b91dd13af93aad2e5958"`);
        await queryRunner.query(`ALTER TABLE "stocks" DROP CONSTRAINT "FK_3024bbca6232c8b6efa3ff51028"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_88cea2dc9c31951d06437879b40"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_db6f3ad318303f4ed559dad4ec"`);
        await queryRunner.query(`ALTER TABLE "margins" ALTER COLUMN "value" TYPE numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "category_id"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "measureValue"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "measureUnit"`);
        await queryRunner.query(`DROP TYPE "public"."products_measureunit_enum"`);
        await queryRunner.query(`ALTER TABLE "margins" DROP COLUMN "isPercentage"`);
        await queryRunner.query(`DROP TABLE "stock_losses"`);
        await queryRunner.query(`DROP TYPE "public"."stock_losses_reason_enum"`);
        await queryRunner.query(`DROP TABLE "stock_movements"`);
        await queryRunner.query(`DROP TYPE "public"."stock_movements_type_enum"`);
        await queryRunner.query(`DROP TABLE "stock_parameters"`);
        await queryRunner.query(`DROP TABLE "stocks"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b0be371d28245da6e4f4b6187"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`CREATE INDEX "IDX_177da965b166453029d5fc488a" ON "margins" ("value") `);
    }

}
