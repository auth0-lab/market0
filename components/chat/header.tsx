import Link from "next/link";

import { ArrowRightIcon, IconAuth0 } from "@/components/icons";
import { getSession } from "@auth0/nextjs-auth0";

import { Navbar } from "./navbar";

export async function Header({ children }: { children?: React.ReactNode }) {
  const session = await getSession();
  const user = session?.user!;

  return (
    <header className="z-50 flex items-center justify-between w-full px-5 sm:px-6 py-3 h-14 shrink-0 bg-background">
      <div className="flex items-center gap-6">
        <span className="inline-flex items-center home-links whitespace-nowrap">
          <Link href="https://auth0.com" rel="noopener" target="_blank">
            <IconAuth0 className="w-5 h-5 sm:h-6 sm:w-6" />
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

      <Navbar user={user}>{children}</Navbar>
    </header>
  );
}
