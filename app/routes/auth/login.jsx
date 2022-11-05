import { useEffect, useRef } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { redirect } from "@remix-run/node";
import { commitSession, getSession } from "~/sessions";
import bcrypt from "bcrypt";

export const loader = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  return { session };
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const formObject = Object.fromEntries(formData);
  const db = new PrismaClient();
  const user = await db.Users.findUnique({
    where: {
      email: formObject.email,
    },
  });
  console.log(user);
  if (!user) {
    return { error: "Email does not exist" };
  } else {
    // comparePassword
    const valid = await bcrypt.compare(formObject.password, user.passwordHash);
    console.log(valid);
    if (valid) {
      console.log(user);
      const session = await getSession(request.headers.get("Cookie"));
      session.set("user", user);
      const cookie = await commitSession(session);
      return redirect("/", {
        headers: {
          "Set-Cookie": cookie,
        },
      });
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
            <input type="text" name="email" ref={focusRef} />
            <label htmlFor="password">Password</label>
            <input type="password" name="password" autoComplete="on" />
            <button type="submit">{busy ? "Submitting" : "Log In"}</button>
          </Form>
          <p>{res && res.error}</p>
        </div>
      )}
    </div>
  );
}

export default Login;
