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
  if (obj.password.length < 8) {
    return { error: "Password must be at least 8 characters." };
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
    <div>
      {isSession ? (
        <p>You are already logged in.</p>
      ) : (
        <>
          <Form method="post" ref={formRef}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              name="email"
              ref={focusRef}
              required
            />
            <label htmlFor="name">Name</label>
            <input id="name" type="text" name="name" required />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="on"
              required
            />
            <button type="submit">{busy ? "Submitting" : "Sign Up"}</button>
          </Form>
          <p>{res && res.error}</p>
        </>
      )}
    </div>
  );
}

export default SignUp;
