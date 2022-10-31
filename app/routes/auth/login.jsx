import { Form } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const formObject = Object.fromEntries(formData);
  const prisma = new PrismaClient();
  
};
function login() {
  return (
    <div>
      <Form method="post">
        <label htmlFor="username">Username</label>
        <input type="text" name="username" />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" autoComplete="on" />
        <button type="submit">Login</button>
      </Form>
    </div>
  );
}

export default login;
