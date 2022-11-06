import { createCookieSessionStorage, redirect } from "@remix-run/node"; // or cloudflare/deno
const secret = process.env.SESSION_SECRET || "sike beach";
const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      httpOnly: true,
      sameSite: "lax",
      secrets: [secret],
      secure: process.env.NODE_ENV === "production",
    },
  });
export { getSession, commitSession, destroySession };

export const createUserSession = async (request, userData) => {
  const session = await getSession(request.headers.get("Cookie"));
  session.set("user", userData);
  const cookie = await commitSession(session);
  return redirect("/", {
    headers: {
      "Set-Cookie": cookie,
    },
  });
};
