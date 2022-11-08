import { Link, useLoaderData } from "@remix-run/react";
import { getSession } from "~/sessions";
export const loader = async ({ request }) => {
  let session = await getSession(request.headers.get("Cookie"));
  let isSession = session.data.user ? true : false;
  if (isSession) {
    let user = session.data.user;
    return { isSession, user };
  }
  return { isSession };
};
export default function Index() {
  const { isSession, user } = useLoaderData();
  // console.log(folders, user);
  return (
    <>
      {isSession ? (
        <div className="flex flex-col h-full ">
          <p className="text-center text-4xl p-10">Hello {user.name}</p>
          <div className="flex justify-center">
            <Link to="/folders">
              <button className="text-lg border-2 rounded-lg px-4 py-3 bg-neutral-200 hover:shadow-md">
                View Folders
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full ">
          <p className="text-center text-4xl p-10">Hello Guest</p>
          <div className="flex justify-center">
            <div className="flex flex-col">
              <div>
                <Link prefetch="none" to={"/auth/login"}>
                  <div className="m-2 p-2 border-2 border-neutral-300 rounded-md text-center">
                    LogIn
                  </div>
                </Link>
                <Link prefetch="none" to={"/auth/signup"}>
                  <div className="m-2 p-2 border-2 border-neutral-300 rounded-md text-center">
                    SignUp
                  </div>
                </Link>
              </div>
              <div className="text-lg pt-4">
                <p>Test Credentials</p>
                <p>Login : admin1@remix.com </p>
                <p>Password : remixgg </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
