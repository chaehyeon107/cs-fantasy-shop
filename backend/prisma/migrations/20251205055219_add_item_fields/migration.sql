/*
  Warnings:

  - You are about to drop the column `category` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Item` DROP COLUMN `category`,
    DROP COLUMN `stock`,
    ADD COLUMN `category_id` VARCHAR(191) NULL,
    ADD COLUMN `cs_tag` VARCHAR(191) NULL,
    ADD COLUMN `is_active` BOOLEAN NULL,
    ADD COLUMN `rarity` VARCHAR(191) NULL,
    ADD COLUMN `stat_dex` INTEGER NULL,
    ADD COLUMN `stat_int` INTEGER NULL,
    ADD COLUMN `stat_lck` INTEGER NULL,
    ADD COLUMN `stat_str` INTEGER NULL,
    ADD COLUMN `stock_quantity` INTEGER NULL;
