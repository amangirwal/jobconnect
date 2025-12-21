-- AlterTable
ALTER TABLE `Application` ADD COLUMN `resume` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Job` ADD COLUMN `experienceLevel` VARCHAR(191) NOT NULL DEFAULT 'ENTRY_LEVEL',
    ADD COLUMN `jobType` VARCHAR(191) NOT NULL DEFAULT 'FULL_TIME',
    ADD COLUMN `skillsRequired` JSON NULL,
    MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `about` TEXT NULL,
    ADD COLUMN `companyDescription` TEXT NULL,
    ADD COLUMN `companyName` VARCHAR(191) NULL,
    ADD COLUMN `companyWebsite` VARCHAR(191) NULL,
    ADD COLUMN `education` JSON NULL,
    ADD COLUMN `experience` JSON NULL,
    ADD COLUMN `headline` VARCHAR(191) NULL,
    ADD COLUMN `profilePicture` VARCHAR(191) NULL,
    ADD COLUMN `resume` VARCHAR(191) NULL,
    ADD COLUMN `skills` JSON NULL;
