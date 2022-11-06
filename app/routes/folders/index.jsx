import { Form, Link, useLoaderData } from "@remix-run/react";
import { getSession } from "~/sessions";
import { db } from "~/utils/db";

export const loader = async ({ request }) => {
  let session = await getSession(request.headers.get("Cookie"));
  let isSession = session.data.user ? true : false;
  if (isSession) {
    let user = session.data.user;
    let folders = await db.linkFolders.findMany({
      where: {
        userId: user.id,
      },
    });
    return { folders, isSession, user };
  }
  return { isSession };
};

export const action = async ({ request }) => {
  let session = await getSession(request.headers.get("Cookie"));
  let user = session.data.user;
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "delete") {
    return db.linkFolders.delete({
      where: {
        id: parseInt(formData.get("id")),
      },
    });
  }
  const obj = Object.fromEntries(formData);
  const newFolder = {
    name: obj.name,
    userId: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return db.linkFolders.create({
    data: newFolder,
  });
};

function Folders() {
  const { folders } = useLoaderData();
  return (
    <>
      <div className="grid grid-cols-3 p-4">
        {folders.map((folder) => {
          return (
            <div key={folder.id} className="border-2 p-1">
              <Link to={`/folders/${folder.id}`}>
                <p>{folder.name}</p>
                <Form method="post">
                  <input type="hidden" name="id" value={folder.id} />
                  <button
                    type="submit"
                    name="intent"
                    value="delete"
                    className="border p-2"
                  >
                    Delete
                  </button>
                </Form>
              </Link>
            </div>
          );
        })}
      </div>
      <Form method="post">
        <label htmlFor="name">Create New Folder</label>
        <input type="text" id="name" name="name" required />
        <button type="submit">Create</button>
      </Form>
    </>
  );
}

export default Folders;
