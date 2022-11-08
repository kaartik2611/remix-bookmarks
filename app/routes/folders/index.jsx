import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { getSession } from "~/sessions";
import { db } from "~/utils/db";
import { useRef, useEffect } from "react";
import { getLinksFromFolderId } from "./../../utils/getLinks";

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
    folders = await Promise.all(
      folders.map(async (folder) => {
        let links = await getLinksFromFolderId(folder.id);
        return { ...folder, links };
      })
    );
    return { isSession, folders, user };
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
  const transition = useTransition();
  const isCreating = transition.submission?.formData.get("intent") === "create";
  const { folders, isSession } = useLoaderData();
  const res = useActionData();
  const formRef = useRef();
  const focusRef = useRef();
  useEffect(() => {
    formRef.current?.reset();
    focusRef.current?.focus();
  }, [res]);
  return (
    <div className='flex flex-col sm:h-full'>
      {isSession ? (
        <div className="flex justify-center h-full">
          <main className="mx-4 md:mx-20 xl:mx-36">
            <p className="text-4xl text-center py-4">All Folders</p>
            <div className="flex justify-end">
              {folders.length > 0 && (
                <button
                  className="text-xl border-2 bg-neutral-300 border-neutral-500 p-2 cursor-pointer mr-4 rounded-md"
                  aria-label="Add Folder"
                  title="Add Folder"
                  onClick={() => focusRef.current?.focus()}
                >
                  Add Folder
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4 gap-4">
              {folders.map((folder) => {
                return (
                  <div
                    key={folder.id}
                    className="border-2 border-neutral-300 bg-neutral-100 rounded-md p-3 pb-4 min-w-[15rem]"
                  >
                    <Link to={`/folders/${folder.id}`}>
                      <p className="text-center text-xl py-3 px-2 truncate">
                        {folder.name}
                      </p>
                      <div className="text-lg">
                        {folder.links ? (
                          <p className="py-2">
                            {folder.links}{" "}
                            {folder.links === 1 ? "link " : "links "}
                            present
                          </p>
                        ) : (
                          <p className="py-2">Click to add links</p>
                        )}
                      </div>
                    </Link>
                    <Form method="post">
                      <input type="hidden" name="id" value={folder.id} />
                      <button
                        aria-label="Delete Folder"
                        title="Delete Folder"
                        type="submit"
                        name="intent"
                        value="delete"
                        className="border p-1.5 border-red-600 bg-red-50 "
                      >
                        Delete Folder
                      </button>
                    </Form>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center pt-5">
              <Form method="post" ref={formRef}>
                <label
                  htmlFor="name"
                  className="block font-bold uppercase text-sm"
                >
                  Create New Folder
                </label>
                <input
                  placeholder="Folder Name"
                  type="text"
                  id="name"
                  name="name"
                  ref={focusRef}
                  className="p-2 border-2 border-neutral-300 rounded-md"
                  required
                />
                <button
                  aria-label="Create Folder"
                  title="Create Folder"
                  type="submit"
                  name="intent"
                  value="create"
                  disabled={isCreating}
                  className="m-2 p-2 border-2 border-neutral-300 rounded-md"
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </Form>
            </div>
          </main>
        </div>
      ) : (
        <div className="h-full pt-10">
          <p className="text-center text-2xl">Login to continue</p>
        </div>
      )}
    </div>
  );
}

export default Folders;
