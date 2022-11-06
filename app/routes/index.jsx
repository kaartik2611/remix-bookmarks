import { Link, useLoaderData } from "@remix-run/react";
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
export default function Index() {
  const { folders, isSession, user } = useLoaderData();
  // console.log(folders, user);
  return (
    <>
      <div>
        <p className="text-center text-4xl p-10">Hello Remix</p>
        {!isSession ? (
          <>
            <Link prefetch="none" to={"/auth/login"}>
              <button>Log In</button>
            </Link>
            <Link prefetch="none" to={"/auth/signup"}>
              <button>Sign Up</button>
            </Link>
          </>
        ) : (
          <>
            <p>Hello {user.name}</p>
            <Link prefetch="none" to={"/auth/logout"}>
              <button>Log Out</button>
            </Link>
          </>
        )}
      </div>
    </>
  );
}
