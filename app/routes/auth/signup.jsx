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

export async function action({ request }) {
  const formData = await request.formData();
  const obj = Object.fromEntries(formData);
  const db = new PrismaClient();
  if (obj.email === "" || obj.password === "" || obj.name === "") {
    return { error: "Please fill out all fields." };
  }
  if (obj.password.length < 7) {
    return { error: "Password must be at least 7 characters." };
  }
  const hashedPassword = await bcrypt.hash(obj.password, 10);
  const newUser = {
    email: obj.email,
    passwordHash: hashedPassword,
    name: obj.name,
  };
  try {
    const res = await db.Users.create({
      data: newUser,
    });
    const userData = {
      userId: res.id,
      email: obj.email,
      name: obj.name,
    };
    return createUserSession(request, userData);
  } catch (e) {
    if (e.code === "P2002") {
      return { error: "Email already exists." };
    } else {
      console.error(e);
      return { error: "Something went wrong." };
    }
  }
}

export function SignUp() {
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
                required
                placeholder="Enter Email"
              />
              <label htmlFor="name" className="block uppercase font-bold">
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                className="my-2 p-2 border-2 border-neutral-300 rounded-md"
                placeholder="Enter Username"
                required
              />
              <label htmlFor="password" className="block uppercase font-bold">
                Password
              </label>
              <input
                className="my-2 p-2 border-2 border-neutral-300 rounded-md"
                id="password"
                type="password"
                name="password"
                autoComplete="on"
                placeholder="Enter Password"
                required
              />
              <button
                aria-label="Sign Up"
                title="Sign Up"
                type="submit"
                className="m-2 p-2 border-2 border-neutral-300 rounded-md"
              >
                {busy ? "Submitting" : "Sign Up"}
              </button>
            </div>
          </Form>
          <p>{res && res.error}</p>
        </>
      )}
    </div>
  );
}

export default SignUp;
