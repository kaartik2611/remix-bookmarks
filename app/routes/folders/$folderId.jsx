import { Form, useLoaderData, useParams } from "@remix-run/react";
import { getSession } from "~/sessions";
import { db } from "~/utils/db";

export const loader = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.data.user;
  const folder = await db.linkFolders.findUnique({
    where: {
      id: parseInt(params.folderId),
    },
  });
  const links = await db.link.findMany({
    where: {
      folderId: parseInt(params.folderId),
    },
  });
  return { folder, links, user };
};

export const action = async ({ request, params }) => {
  const folderId = parseInt(params.folderId);
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "delete") {
    return db.link.delete({
      where: {
        id: parseInt(formData.get("id")),
      },
    });
  }
  const obj = Object.fromEntries(formData);
  const newLink = {
    name: obj.name,
    url: obj.url,
    folderId: parseInt(folderId),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return db.link.create({
    data: newLink,
  });
};

export default function Folder() {
  const params = useParams();
  const { links } = useLoaderData();
  console.log(links);
  return (
    <>
      <p>{params.folderId}</p>
      <div>
        {links.map((link) => {
          return (
            <div key={link.id} className="border-2 p-1">
              <p>{link.name}</p>
              <p>{link.url}</p>
              <Form method="post">
                <input type="hidden" name="id" value={link.id} />
                <button
                  type="submit"
                  name="intent"
                  value="delete"
                  className="border p-2"
                >
                  Delete
                </button>
              </Form>
            </div>
          );
        })}
      </div>
      <Form method="post">
        <label htmlFor="name">title</label>
        <input id="name" type="text" name="name" />
        <label htmlFor="url">Link</label>
        <input id="url" type="text" name="url" />
        <button type="submit">Submit</button>
      </Form>
    </>
  );
}
