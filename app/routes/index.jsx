import { PrismaClient } from "@prisma/client";
import { Link, useLoaderData } from "@remix-run/react";
import { getSession } from "~/sessions";

export const loader = async ({ request }) => {
  // session check
  const session = await getSession(request.headers.get("Cookie"));
  
  return { session };
};
export default function Index() {
  const users = useLoaderData();
  console.log(users);
  return (
    <div>
      <p className="text-center text-4xl p-10">Hello Remix</p>
      <Link prefetch="none" to={"/auth/login"}>
        <button>Log In</button>
      </Link>
      <Link prefetch="none" to={"/auth/signup"}>
        <button>Sign Up</button>
      </Link>
    </div>
  );
}
