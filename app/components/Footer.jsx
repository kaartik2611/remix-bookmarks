import React from "react";

function Footer() {
  return (
    <div className="flex">
      <div className="w-full text-center p-4 bg-neutral-200">
        Made with <span className="text-red-500">&#9829;</span> with Remix,
        Tailwind and Prisma.
      </div>
    </div>
  );
}

export default Footer;
