import { PrismaClient } from "@prisma/client";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { useEffect, useRef } from "react";
import bcrypt from "bcryptjs";
import { commitSession, getSession } from "~/sessions";
export async function action({ request }) {
  const body = await request.formData();
  const json = Object.fromEntries(body);
  const db = new PrismaClient();
  if (json.email === "" || json.password === "" || json.name === "") {
    return { error: "Please fill out all fields." };
  }
  if (json.password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  const hashedPassword = await bcrypt.hash(json.password, 10);
  const newUser = {
    email: json.email,
    passwordHash: hashedPassword,
    name: json.name,
  };
  try {
    const x = await db.Users.create({
      data: newUser,
    });

    // ! TODO add session here

    const userData = {
      userId: x.id,
      email: json.email,
      name: json.name,
    };
    const session = await getSession(request.headers.get("Cookie"));
    session.set("user", userData);
    const cookie = await commitSession(session);
    return redirect("/", {
      headers: {
        "Set-Cookie": cookie,
      },
    });
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
  const { state } = useTransition();
  const busy = state === "submitting";
  const res = useActionData();
  const formRef = useRef(); //for resetting form
  const focusRef = useRef(); //focus back on first input
  useEffect(() => {
    formRef.current?.reset();
    focusRef.current?.focus();
  }, [res]);
  return (
    <>
      <Form method="post" ref={formRef}>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" name="email" ref={focusRef} required />
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
  );
}

export default SignUp;
