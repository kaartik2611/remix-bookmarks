import { Link } from "@remix-run/react";

function Navbar({ user, isSession }) {
  return (
    <div className="flex justify-center bg-neutral-200">
      <div className="max-w-5xl w-full flex flex-row justify-around">
        <div className="my-auto">
          <Link to="/">
            <p className="text-xl sm:text-4xl font-bold">Remix Bookmarks</p>
          </Link>
        </div>
        <div className="flex flex-row my-3 space-x-1 sm:space-x-3 text-sm sm:text-base">
          {isSession ? (
            <>
              <div className="">
                <Link to="/folders">
                  <div className="bg-neutral-300 hover:shadow-md p-1 sm:p-2 rounded sm:rounded-lg">
                    Folders
                  </div>
                </Link>
              </div>
              <div className="bg-neutral-300 rounded-full p-1 sm:p-2 hover:shadow-md">
                <button>{user.name.split(" ").map((e) => e[0])}</button>
              </div>
              <Link prefetch="none" to={"/auth/logout"}>
                <div className="bg-neutral-300 hover:shadow-md p-1 sm:p-2 rounded sm:rounded-lg">
                  Log Out
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link prefetch="none" to={"/auth/login"}>
                <div className="bg-neutral-300 hover:shadow-md p-1 sm:p-2 rounded sm:rounded-lg">
                  LogIn
                </div>
              </Link>
              <Link prefetch="none" to={"/auth/signup"}>
                <div className="bg-neutral-300 hover:shadow-md p-1 sm:p-2 rounded sm:rounded-lg">
                  SignUp
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
