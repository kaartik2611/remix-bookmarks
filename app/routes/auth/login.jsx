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
    const valid = await bcrypt.compare(obj.passwordHash, user.passwordHash);
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
    <div className="h-full">
      {isSession ? (
        <p className="text-center text-3xl pt-10">You are already logged in.</p>
      ) : (
        <>
          <Form
            method="post"
            ref={formRef}
            className="flex justify-center pt-10"
          >
            <div className="flex flex-col">
              <label htmlFor="email" className="block uppercase font-bold">
                Email
              </label>
              <input
                className="my-2 p-2 border-2 border-neutral-300 rounded-md"
                id="email"
                type="text"
                name="email"
                ref={focusRef}
                placeholder="Enter Email"
                required
              />
              <label
                htmlFor="passwordHash"
                className="block uppercase font-bold"
              >
                Password
              </label>
              <input
                className="my-2 p-2 border-2 border-neutral-300 rounded-md"
                id="password"
                type="password"
                name="passwordHash"
                autoComplete="on"
                placeholder="Enter Password"
                required
              />
              <button
                aria-label="Login"
                title="Login"
                type="submit"
                className="m-2 p-2 border-2 border-neutral-300 rounded-md"
              >
                {busy ? "Submitting" : "Log In"}
              </button>
            </div>
          </Form>
          <p>{res && res.error}</p>
        </>
      )}
    </div>
  );
}

export default Login;
