import Link from "next/link";

import { ArrowRightIcon, GHIcon, IconAuth0 } from "@/components/icons";
import { getSession } from "@auth0/nextjs-auth0";

import UserButton from "../auth0/user-button";
import { DropdownMenu, DropdownMenuGroup, DropdownMenuItem, DropdownMenuShortcut } from "../ui/dropdown-menu";
import { ShareConversation } from "./share";

export async function Header() {
  const session = await getSession();
  const user = session?.user!;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full px-6 py-3 h-14 shrink-0 bg-background backdrop-blur-xl">
      <div className="flex items-center gap-6">
        <span className="inline-flex items-center home-links whitespace-nowrap">
          <Link href="https://lab.auth0.com" rel="noopener" target="_blank">
            <IconAuth0 className="w-5 h-5 sm:h-6 sm:w-6" />
          </Link>
        </span>
        <Link
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-black transition-all duration-300 text-sm font-light text-slate-500 flex items-center gap-1"
        >
          Learn about Auth for GenAI <ArrowRightIcon />
        </Link>
      </div>
      <div className="flex items-center justify-end gap-6">
        <div className="flex items-center justify-end gap-6">
          <ShareConversation user={user} />

          <Link
            href="https://github.com/auth0-lab/market0"
            rel="noopener noreferrer"
            target="_blank"
            className="bg-white text-slate-500 border border-slate-500 flex gap-2 items-center px-3 py-2 rounded-md text-sm hover:bg-gray-100 hover:text-black transition-colors duration-300"
          >
            <GHIcon /> GitHub
          </Link>
          <UserButton user={user}>
            <DropdownMenu>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Link href="/profile" className="flex gap-2 items-center">
                    Profile
                  </Link>
                  <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenu>
          </UserButton>
        </div>
      </div>
    </header>
  );
}
