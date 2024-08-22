import Link from "next/link";

import { IconAuth0 } from "@/components/icons";
import { getSession } from "@auth0/nextjs-auth0";

import UserButton from "./auth0/user-button";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "./ui/dropdown-menu";

export async function Header() {
  const session = await getSession();
  const user = session?.user!;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full px-4 py-3 h-14 shrink-0 bg-background backdrop-blur-xl">
      <span className="inline-flex items-center home-links whitespace-nowrap">
        <Link href="https://lab.auth0.com" rel="noopener" target="_blank">
          <IconAuth0 className="w-5 h-5 sm:h-6 sm:w-6" />
        </Link>
      </span>
      <div className="flex items-center justify-end space-x-2">
        <UserButton user={user}>
          <DropdownMenu>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenu>
        </UserButton>
      </div>
    </header>
  );
}
