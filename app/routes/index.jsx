import { PrismaClient } from "@prisma/client";
import { Link, useLoaderData } from "@remix-run/react";

export const loader = async () => {
  const db = new PrismaClient();
  const users = await db.Users.findMany();
  console.log(users);
  return users;
};
export default function Index() {
  const users = useLoaderData();
  return (
    <div>
      <p>Hello Remix</p>
      <Link prefetch="none" to={"/auth/login"}>
        Log In
      </Link>
      <Link prefetch="none" to={"/auth/signup"}>
        Sign Up
      </Link>
      <p>hello world</p>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
