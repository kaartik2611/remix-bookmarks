import { PrismaClient } from "@prisma/client";
import { redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";

export async function action({ request }) {
  const body = await request.formData();
  const json = Object.fromEntries(body);
  const db = new PrismaClient();
  if (json.email === "" || json.password === "" || json.name === "") {
    return { error: "Please fill out all fields." };
  }
  try {
    await db.Users.create({
      data: {
        email: json.email,
        name: json.name,
        password: json.password,
      },
    });
    return redirect("/");
  } catch (e) {
    if (e) {
      if (e.code === "P2002") {
        console.log(
          "There is a unique constraint violation, a new user cannot be created with this email"
        );
        return { error: "Email already exists" };
      }
    }
  }
}
export function SignUp() {
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
        <input type="text" name="email" ref={focusRef} />
        <label htmlFor="name">Name</label>
        <input type="text" name="name" />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" autoComplete="on" />
        <button type="submit">Sign Up</button>
      </Form>
      <p>{res && res.error}</p>
    </>
  );
}

export default SignUp;
