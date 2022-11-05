import { redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/sessions";
export const loader = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};
function LogOut() {
  return <p>Logging you Out...</p>;
}

export default LogOut;
