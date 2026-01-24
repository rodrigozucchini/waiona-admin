import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1769218246153 implements MigrationInterface {
    name = 'Init1769218246153'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."persons_type_enum" AS ENUM('PERSON', 'COMPANY')`);
        await queryRunner.query(`CREATE TYPE "public"."persons_documenttype_enum" AS ENUM('DNI', 'CUIL', 'CUIT', 'PASSPORT')`);
        await queryRunner.query(`CREATE TABLE "persons" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "firstName" character varying(80) NOT NULL, "lastName" character varying(80) NOT NULL, "email" character varying(100) NOT NULL, "phoneNumber" character varying(20), "address" character varying(200), "type" "public"."persons_type_enum" NOT NULL, "documentType" "public"."persons_documenttype_enum", "documentNumber" character varying(30), CONSTRAINT "UQ_928155276ca8852f3c440cc2b2c" UNIQUE ("email"), CONSTRAINT "PK_74278d8812a049233ce41440ac7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "permissions" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "key" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "UQ_017943867ed5ceef9c03edd9745" UNIQUE ("key"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."roles_type_enum" AS ENUM('super_admin', 'admin', 'manager', 'operator', 'client')`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "type" "public"."roles_type_enum" NOT NULL, CONSTRAINT "UQ_ff503f858b61860b2b7d7a55ceb" UNIQUE ("type"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'blocked')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "password" character varying(255) NOT NULL, "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "emailVerified" boolean NOT NULL DEFAULT false, "lastLoginAt" TIMESTAMP, "person_id" integer NOT NULL, "role_id" integer NOT NULL, CONSTRAINT "REL_5ed72dcd00d6e5a88c6a6ba3d1" UNIQUE ("person_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5ed72dcd00d6e5a88c6a6ba3d1" ON "users" ("person_id") `);
        await queryRunner.query(`CREATE TABLE "tax_types" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "code" character varying(20) NOT NULL, "name" character varying(150) NOT NULL, CONSTRAINT "UQ_e55508e555edfdd379ff6772a47" UNIQUE ("code"), CONSTRAINT "PK_0eb0ecec0ae0c193f791057058a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e55508e555edfdd379ff6772a4" ON "tax_types" ("code") `);
        await queryRunner.query(`CREATE TABLE "taxes" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "value" numeric(10,2) NOT NULL, "isPercentage" boolean NOT NULL DEFAULT true, "tax_type_id" integer NOT NULL, CONSTRAINT "PK_6c58c9cbb420c4f65e3f5eb8162" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_23dcfd0ceab5fa8f46a1843514" ON "taxes" ("tax_type_id") `);
        await queryRunner.query(`CREATE TABLE "combos" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "name" character varying(255) NOT NULL, "description" character varying(500), CONSTRAINT "PK_5b4bab633aee439e2bade42cc3c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "combo_products" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "comboId" integer NOT NULL, "productId" integer NOT NULL, "quantity" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_23f772170e6e9fa4c940ca67e58" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e036be71b49a40ae4af158c3a2" ON "combo_products" ("comboId", "productId") `);
        await queryRunner.query(`CREATE TABLE "combo_images" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "comboId" integer NOT NULL, "imageId" integer NOT NULL, CONSTRAINT "PK_3ca82deb38d1873ed35923bfa33" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7f2a3c468cc9d25ea5d2144248" ON "combo_images" ("comboId", "imageId") `);
        await queryRunner.query(`CREATE TABLE "images" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "url" character varying(255) NOT NULL, "order" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_images" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "productId" integer NOT NULL, "imageId" integer NOT NULL, CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_52e019b6e8e32b79a69c92ae9c" ON "product_images" ("productId", "imageId") `);
        await queryRunner.query(`CREATE TABLE "margins" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "value" numeric(5,2) NOT NULL, CONSTRAINT "PK_c09afde434626e11e00e10b61f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_177da965b166453029d5fc488a" ON "margins" ("value") `);
        await queryRunner.query(`CREATE TYPE "public"."products_type_enum" AS ENUM('BEVERAGE', 'SNACK', 'SERVICE')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "sku" character varying(50) NOT NULL, "name" character varying(255) NOT NULL, "description" character varying(500), "type" "public"."products_type_enum" NOT NULL, "basePrice" numeric(10,2) NOT NULL, "margin_id" integer, CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "discount_types" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "code" character varying(50) NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "UQ_78c38509ab58c53de1b8f9f4279" UNIQUE ("code"), CONSTRAINT "PK_b8680bade668df47e67dcdfc93b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_78c38509ab58c53de1b8f9f427" ON "discount_types" ("code") `);
        await queryRunner.query(`CREATE TABLE "discounts" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "value" numeric(10,2) NOT NULL, "isPercentage" boolean NOT NULL, "discount_type_id" integer NOT NULL, CONSTRAINT "PK_66c522004212dc814d6e2f14ecc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_95542361e645fe0ebbb969ebeb" ON "discounts" ("discount_type_id") `);
        await queryRunner.query(`CREATE TABLE "coupons" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "code" character varying(50) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "maxUses" integer, "usedCount" integer NOT NULL DEFAULT '0', "expiresAt" TIMESTAMP, "discount_id" integer NOT NULL, CONSTRAINT "UQ_e025109230e82925843f2a14c48" UNIQUE ("code"), CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e025109230e82925843f2a14c4" ON "coupons" ("code") `);
        await queryRunner.query(`CREATE TABLE "role_permissions" ("role_id" integer NOT NULL, "permission_id" integer NOT NULL, CONSTRAINT "PK_25d24010f53bb80b78e412c9656" PRIMARY KEY ("role_id", "permission_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions" ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id") `);
        await queryRunner.query(`CREATE TABLE "product_taxes" ("product_id" integer NOT NULL, "tax_id" integer NOT NULL, CONSTRAINT "PK_eedbaf8b313da40dcd05484bb7f" PRIMARY KEY ("product_id", "tax_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1d39e319e41b1edce44933cfe7" ON "product_taxes" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_db8c22b3e1e26adae58c92dc64" ON "product_taxes" ("tax_id") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_5ed72dcd00d6e5a88c6a6ba3d18" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "taxes" ADD CONSTRAINT "FK_23dcfd0ceab5fa8f46a1843514a" FOREIGN KEY ("tax_type_id") REFERENCES "tax_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "combo_products" ADD CONSTRAINT "FK_467caf16e7fbedecb086ad7bd0f" FOREIGN KEY ("comboId") REFERENCES "combos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "combo_products" ADD CONSTRAINT "FK_9d8e2146a6b4d0ebfc2df534714" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "combo_images" ADD CONSTRAINT "FK_8c5ce9aea78845ee1d5c7a5eeda" FOREIGN KEY ("comboId") REFERENCES "combos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "combo_images" ADD CONSTRAINT "FK_ad6bbfd182515630eb564999e85" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_images" ADD CONSTRAINT "FK_b367708bf720c8dd62fc6833161" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_images" ADD CONSTRAINT "FK_9eb7d7ebaf2263ae0e45fea9184" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_f09110565d40804e40e0ddc8698" FOREIGN KEY ("margin_id") REFERENCES "margins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "discounts" ADD CONSTRAINT "FK_95542361e645fe0ebbb969ebeb9" FOREIGN KEY ("discount_type_id") REFERENCES "discount_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coupons" ADD CONSTRAINT "FK_4b9bcd27d65ae1022462410b6d5" FOREIGN KEY ("discount_id") REFERENCES "discounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "product_taxes" ADD CONSTRAINT "FK_1d39e319e41b1edce44933cfe75" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "product_taxes" ADD CONSTRAINT "FK_db8c22b3e1e26adae58c92dc64e" FOREIGN KEY ("tax_id") REFERENCES "taxes"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_taxes" DROP CONSTRAINT "FK_db8c22b3e1e26adae58c92dc64e"`);
        await queryRunner.query(`ALTER TABLE "product_taxes" DROP CONSTRAINT "FK_1d39e319e41b1edce44933cfe75"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`);
        await queryRunner.query(`ALTER TABLE "coupons" DROP CONSTRAINT "FK_4b9bcd27d65ae1022462410b6d5"`);
        await queryRunner.query(`ALTER TABLE "discounts" DROP CONSTRAINT "FK_95542361e645fe0ebbb969ebeb9"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_f09110565d40804e40e0ddc8698"`);
        await queryRunner.query(`ALTER TABLE "product_images" DROP CONSTRAINT "FK_9eb7d7ebaf2263ae0e45fea9184"`);
        await queryRunner.query(`ALTER TABLE "product_images" DROP CONSTRAINT "FK_b367708bf720c8dd62fc6833161"`);
        await queryRunner.query(`ALTER TABLE "combo_images" DROP CONSTRAINT "FK_ad6bbfd182515630eb564999e85"`);
        await queryRunner.query(`ALTER TABLE "combo_images" DROP CONSTRAINT "FK_8c5ce9aea78845ee1d5c7a5eeda"`);
        await queryRunner.query(`ALTER TABLE "combo_products" DROP CONSTRAINT "FK_9d8e2146a6b4d0ebfc2df534714"`);
        await queryRunner.query(`ALTER TABLE "combo_products" DROP CONSTRAINT "FK_467caf16e7fbedecb086ad7bd0f"`);
        await queryRunner.query(`ALTER TABLE "taxes" DROP CONSTRAINT "FK_23dcfd0ceab5fa8f46a1843514a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_5ed72dcd00d6e5a88c6a6ba3d18"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_db8c22b3e1e26adae58c92dc64"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1d39e319e41b1edce44933cfe7"`);
        await queryRunner.query(`DROP TABLE "product_taxes"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_17022daf3f885f7d35423e9971"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_178199805b901ccd220ab7740e"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e025109230e82925843f2a14c4"`);
        await queryRunner.query(`DROP TABLE "coupons"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_95542361e645fe0ebbb969ebeb"`);
        await queryRunner.query(`DROP TABLE "discounts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_78c38509ab58c53de1b8f9f427"`);
        await queryRunner.query(`DROP TABLE "discount_types"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_177da965b166453029d5fc488a"`);
        await queryRunner.query(`DROP TABLE "margins"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_52e019b6e8e32b79a69c92ae9c"`);
        await queryRunner.query(`DROP TABLE "product_images"`);
        await queryRunner.query(`DROP TABLE "images"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7f2a3c468cc9d25ea5d2144248"`);
        await queryRunner.query(`DROP TABLE "combo_images"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e036be71b49a40ae4af158c3a2"`);
        await queryRunner.query(`DROP TABLE "combo_products"`);
        await queryRunner.query(`DROP TABLE "combos"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_23dcfd0ceab5fa8f46a1843514"`);
        await queryRunner.query(`DROP TABLE "taxes"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e55508e555edfdd379ff6772a4"`);
        await queryRunner.query(`DROP TABLE "tax_types"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5ed72dcd00d6e5a88c6a6ba3d1"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TYPE "public"."roles_type_enum"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP TABLE "persons"`);
        await queryRunner.query(`DROP TYPE "public"."persons_documenttype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."persons_type_enum"`);
    }

}
