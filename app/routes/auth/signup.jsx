import { PrismaClient } from "@prisma/client";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { useEffect, useRef } from "react";
import bcrypt from "bcryptjs";
export async function action({ request }) {
  const body = await request.formData();
  const json = Object.fromEntries(body);
  const db = new PrismaClient();
  if (json.email === "" || json.password === "" || json.name === "") {
    return { error: "Please fill out all fields." };
  }
  const hashedPassword = await bcrypt.hash(json.password, 10);
  try {
    await db.Users.create({
      data: {
        email: json.email,
        name: json.name,
        password: hashedPassword,
      },
    });
    await db.$disconnect();
    return redirect("/auth/login/", {
      message: "You have successfully signed up. Please log in.",
    });
  } catch (e) {
    if (e) {
      return { error: "Email already exists" };
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
        <input type="text" name="email" ref={focusRef} required />
        <label htmlFor="name">Name</label>
        <input type="text" name="name" required />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" autoComplete="on" required />
        <button type="submit">{busy ? "Submitting" : "Sign Up"}</button>
      </Form>
      <p>{res && res.error}</p>
    </>
  );
}

export default SignUp;
