import Navbar from "./components/Navbar";
import styles from "./styles/app.css";
import { getSession } from "~/sessions";
import Footer from "./components/Footer";
const {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} = require("@remix-run/react");

export const loader = async ({ request }) => {
  let session = await getSession(request.headers.get("Cookie"));
  let isSession = session.data.user ? true : false;
  if (isSession) {
    let user = session.data.user;
    return { user, isSession };
  } else {
    return { isSession };
  }
};
export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
export const meta = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  const { user, isSession } = useLoaderData();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-neutral-100 text-neutral-900 scroll-smooth flex flex-col h-screen">
        <Navbar user={user} isSession={isSession} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <Footer />
      </body>
    </html>
  );
}
