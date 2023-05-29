/*
  Warnings:

  - You are about to drop the column `login` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "idCardNumber" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("address", "birthDate", "email", "idCardNumber", "isVerified", "name", "password", "surname", "userId") SELECT "address", "birthDate", "email", "idCardNumber", "isVerified", "name", "password", "surname", "userId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_idCardNumber_key" ON "User"("idCardNumber");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
