import { Link, useLoaderData } from "@remix-run/react";
import Folders from "~/components/Folders";
import { getSession } from "~/sessions";

export const loader = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  return { session };
};
export default function Index() {
  const { session } = useLoaderData();
  let isSession = session.data.user ? true : false;
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
          <Link prefetch="none" to={"/auth/logout"}>
            <button>Log Out</button>
          </Link>
        )}
      </div>
      <Folders />
    </>
  );
}
