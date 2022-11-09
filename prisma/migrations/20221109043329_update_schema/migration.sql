-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_folderId_fkey";

-- DropForeignKey
ALTER TABLE "LinkFolders" DROP CONSTRAINT "LinkFolders_userId_fkey";

-- AddForeignKey
ALTER TABLE "LinkFolders" ADD CONSTRAINT "LinkFolders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "LinkFolders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
