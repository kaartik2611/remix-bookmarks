import { useEffect, useRef } from "react";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createUserSession, getSession } from "~/sessions";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";

export const loader = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  return { session };
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const obj = Object.fromEntries(formData);
  const db = new PrismaClient();
  const user = await db.Users.findUnique({
    where: {
      email: obj.email,
    },
  });
  console.log(user);
  if (!user) {
    return { error: "Email does not exist" };
  } else {
    // comparePassword
    const valid = await bcrypt.compare(obj.password, user.passwordHash);
    if (valid) {
      return createUserSession(request, user);
    } else {
      return { error: "Incorrect Username or password" };
    }
  }
};

function Login() {
  const { session } = useLoaderData();
  const { state } = useTransition();
  const busy = state === "submitting";
  const res = useActionData();
  const formRef = useRef(); //for resetting form
  const focusRef = useRef(); //focus back on first input
  useEffect(() => {
    formRef.current?.reset();
    focusRef.current?.focus();
  }, [res]);
  let isSession = session.data.user ? true : false;

  return (
    <div>
      {isSession ? (
        <p>You are already logged in.</p>
      ) : (
        <div>
          <Form method="post" ref={formRef}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              name="email"
              ref={focusRef}
              required
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="on"
              required
            />
            <button type="submit">{busy ? "Submitting" : "Log In"}</button>
          </Form>
          <p>{res && res.error}</p>
        </div>
      )}
    </div>
  );
}

export default Login;
