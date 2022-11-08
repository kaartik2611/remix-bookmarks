import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { getSession } from "~/sessions";
import { useEffect, useRef, useState } from "react";
import { db } from "~/utils/db";

export const loader = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  let isSession = session.data.user ? true : false;
  if (isSession) {
    try {
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
      return { isSession, folder, links };
    } catch (error) {
      return { isSession, error };
    }
  } else {
    return { isSession };
  }
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
  const { folder, links, isSession } = useLoaderData();
  const transition = useTransition();
  const isCreating = transition.submission?.formData.get("intent") === "create";
  const res = useActionData();
  const formRef = useRef();
  const focusRef = useRef();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    formRef.current?.reset();
    focusRef.current?.focus();
  }, [res]);
  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
    return () => clearTimeout();
  }, [copied]);
  return (
    <>
      {isSession && folder ? (
        <>
          <div className="sm:flex sm:justify-center mx-6 md:mx-20 xl:mx-36 pt-10">
            <div className="sm:flex-col grow sm:max-w-[24rem]">
              {copied && (
                <div className="absolute top-2 rounded-md text-3xl text-red-700 bg-red-50 font-bold">
                  Copied!
                </div>
              )}
              <div className="border-2 border-b-0 rounded-t-md flex justify-around">
                <p className="text-xl px-2 py-3">{folder.name}</p>
                <div
                  className="my-auto cursor-pointer border hover:border-black rounded"
                  aria-label="Add Link"
                  title="Add Link"
                  onClick={() => focusRef.current?.focus()}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </div>
              <div className="last:rounded-b-md">
                {links.map((link) => {
                  return (
                    <div
                      key={link.id}
                      className="flex flex-row flex-wrap border-2 last:rounded-b-md even:bg-stone-50 odd:bg-slate-200"
                    >
                      <div className="flex flex-col grow p-2">
                        <p>{link.name}</p>
                        <a href={link.url} className="text-blue-700">
                          {link.url.replace(/(^\w+:|^)\/\//, "").length > 20
                            ? link.url
                                .replace(/(^\w+:|^)\/\//, "")
                                .slice(0, 20) + "..."
                            : link.url.replace(/(^\w+:|^)\/\//, "")}
                        </a>
                      </div>
                      <div className="flex flex-row justify-end">
                        <Form method="post">
                          <input type="hidden" name="id" value={link.id} />
                          <button
                            aria-label="Delete Link"
                            title="Delete Link"
                            type="submit"
                            name="intent"
                            value="delete"
                            className="px-2 h-full"
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </Form>
                        <button
                          id={link.id}
                          className="px-2"
                          aria-label="Copy to Clipboard"
                          title="Copy to Clipboard"
                          onClick={(e) => {
                            navigator.clipboard.writeText(link.url);
                            setCopied(true);
                          }}
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex justify-center pt-5 h-full">
            <Form method="post" ref={formRef} className="flex-col">
              <div className="flex-row">
                <label
                  htmlFor="name"
                  className="block font-bold uppercase text-sm"
                >
                  Enter Title
                </label>
                <input
                  ref={focusRef}
                  id="name"
                  type="text"
                  name="name"
                  className="my-2 p-2 border-2 border-neutral-300 rounded-md"
                  placeholder="Enter Some Title"
                  required
                />
                <label
                  htmlFor="url"
                  className="block font-bold uppercase text-sm"
                >
                  Enter Url
                </label>
                <input
                  placeholder="https://"
                  id="url"
                  type="url"
                  name="url"
                  className="my-2 p-2 border-2 border-neutral-300 rounded-md"
                  onFocus={(e) => {
                    if (e.target.value === "") {
                      e.target.value = "https://";
                    }
                  }}
                  required
                />
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  name="intent"
                  value="create"
                  className="m-2 p-2 border-2 border-neutral-300 rounded-md"
                >
                  {isCreating ? "Adding..." : "Add Link"}
                </button>
              </div>
            </Form>
          </div>
        </>
      ) : (
        <div className="h-full pt-10">
          <p className="text-center text-2xl">No Links Found</p>
        </div>
      )}
    </>
  );
}
