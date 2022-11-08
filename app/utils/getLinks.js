import { db } from "~/utils/db";

export const getLinksFromFolderId = async (folderId) => {
  const links = await db.link.findMany({
    where: {
      folderId: folderId,
    },
  });
  return links.length > 0 ? links.length : null;
};
