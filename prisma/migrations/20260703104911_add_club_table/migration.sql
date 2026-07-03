/*
  Warnings:

  - The primary key for the `TimeRow` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `timelines` on the `TimeRow` table. All the data in the column will be lost.
  - The `endDate` column on the `Tournament` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `weight` to the `Fighter` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `birthday` on the `Fighter` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `event` to the `TimeRow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeline` to the `TimeRow` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `date` on the `TimeRow` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `name` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `startDate` on the `Tournament` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Fighter" ADD COLUMN     "clubId" INTEGER,
ADD COLUMN     "tournamentId" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL,
DROP COLUMN "birthday",
ADD COLUMN     "birthday" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "slotNumber" INTEGER,
ADD COLUMN     "tatami" INTEGER,
ADD COLUMN     "tournamentId" TEXT;

-- AlterTable
ALTER TABLE "TimeRow" DROP CONSTRAINT "TimeRow_pkey",
DROP COLUMN "timelines",
ADD COLUMN     "event" TEXT NOT NULL,
ADD COLUMN     "timeline" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "TimeRow_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TimeRow_id_seq";

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "startDate",
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endDate",
ADD COLUMN     "endDate" TIMESTAMP(3),
ALTER COLUMN "info" SET NOT NULL,
ALTER COLUMN "info" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Club" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "tournamentId" TEXT,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Club" ADD CONSTRAINT "Club_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fighter" ADD CONSTRAINT "Fighter_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fighter" ADD CONSTRAINT "Fighter_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;
