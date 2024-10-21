import Link from "next/link";

import { ArrowRightIcon, Auth0Icon, IconAuth0 } from "@/components/icons";
import { getSession } from "@auth0/nextjs-auth0";

import { Navbar } from "./navbar";

export async function Header({
  children,
  outerElements,
}: {
  children?: React.ReactNode;
  outerElements?: React.ReactNode;
}) {
  const session = await getSession();
  const user = session?.user;

  return (
    <header className="z-50 flex items-center justify-between w-full px-5 sm:px-6 py-3 h-14 shrink-0 bg-background gap-6 sm:gap-0">
      <div className="flex items-center gap-6">
        <span className="inline-flex items-center home-links whitespace-nowrap">
          <Link href="https://auth0.com" rel="noopener" target="_blank">
            <IconAuth0 className="hidden sm:inline-flex" />
            <Auth0Icon className="inline-flex sm:hidden" />
          </Link>
        </span>
        <Link
          href="https://auth0.ai"
          target="_blank"
          className="hover:text-black transition-all duration-300 text-sm font-light text-slate-500 items-center gap-1 hidden sm:flex"
        >
          Learn about Auth for GenAI <ArrowRightIcon />
        </Link>
      </div>

      <Navbar user={user} outerElements={outerElements}>
        {children}
      </Navbar>
    </header>
  );
}
