import { Form, useLoaderData } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "@remix-run/node";
// export const loader = async ({ request }) => {
//   return { request };
// };

export const action = async ({ request }) => {
  const formData = await request.formData();
  const formObject = Object.fromEntries(formData);
  const db = new PrismaClient();
  const user = await db.Users.findUnique({
    where: {
      email: formObject.email,
    },
  });
  if (!user) {
    return { error: "Email does not exist" };
  }
  const valid = await bcrypt.compare(formObject.password, user.password);
  if (!valid) {
    return { error: "Incorrect password" };
  } else {
    return redirect("/", {
      headers: {
        "Set-Cookie": `user=${user.id}`,
      },
    });
  }
};
function Login() {
  // const res = useLoaderData();
  return (
    <div>
      <Form method="post">
        <label htmlFor="email">Email</label>
        <input type="email" name="email" />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" autoComplete="on" />
        <button type="submit">Login</button>
      </Form>
    </div>
  );
}

export default Login;
