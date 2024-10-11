"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowRightIcon,
  CloseIcon,
  DiscordIcon,
  DiscordMenuIcon,
  ExternalLink,
  GHIcon,
  GitHubMenuIcon,
  IconAuth0,
  LearnMenuIcon,
  LogoutIcon,
  MenuIcon,
} from "@/components/icons";
import { Claims } from "@auth0/nextjs-auth0";

import UserButton, { getAvatarFallback } from "../auth0/user-button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { DropdownMenu, DropdownMenuGroup, DropdownMenuItem, DropdownMenuShortcut } from "../ui/dropdown-menu";

function MenuMobile({ user, children }: { user: Claims; children?: React.ReactNode }) {
  return (
    <div className="sm:hidden flex items-center">
      <Drawer direction="left" modal={false}>
        <DrawerTrigger>
          <MenuIcon />
        </DrawerTrigger>
        <DrawerContent className="h-full rounded-none">
          <DrawerHeader>
            <DrawerTitle className="px-1">
              <div className="flex justify-between items-center">
                <Link href="https://auth0.com" rel="noopener" target="_blank">
                  <IconAuth0 className="w-5 h-5 sm:h-6 sm:w-6" />
                </Link>

                <DrawerClose>
                  <Button variant="ghost" className="p-0">
                    <CloseIcon />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerTitle>
          </DrawerHeader>
          <ul>
            <li className="border-t border-[#E2E8F0]">
              <Link
                href="https://auth0.com"
                rel="noopener"
                target="_blank"
                className="flex items-center justify-between py-3 px-5"
              >
                <div className="flex items-center gap-4">
                  <LearnMenuIcon />
                  <span className="text-sm text-gray-900">Learn about Auth for GenAI</span>
                </div>
                <ArrowRightIcon />
              </Link>
            </li>
            <li className="flex items-center py-3 px-5 border-t border-[#E2E8F0] justify-between">
              <DrawerClose asChild>{children}</DrawerClose>
              <ArrowRightIcon />
            </li>
            <li className="border-t border-[#E2E8F0]">
              <Link
                href="https://github.com/auth0-lab/market0"
                rel="noopener noreferrer"
                target="_blank"
                className="flex items-center justify-between py-3 px-5"
              >
                <div className="flex items-center gap-4">
                  <GitHubMenuIcon />
                  <span className="text-sm text-gray-900">GitHub</span>
                </div>
                <ExternalLink />
              </Link>
            </li>
            <li className="border-t border-b border-[#E2E8F0]">
              <Link
                href="https://discord.gg/QGHxwDsbQQ"
                rel="noopener noreferrer"
                target="_blank"
                className="flex items-center justify-between py-3 px-5"
              >
                <div className="flex items-center gap-4">
                  <DiscordMenuIcon />
                  <span className="text-sm text-gray-900">Discord</span>
                </div>
                <ExternalLink />
              </Link>
            </li>
          </ul>
          <DrawerFooter className="border-t border-[#E2E8F0] flex flex-col items-center justify-between gap-0 p-0">
            <div className="w-full min-h-[57px]">
              <DrawerClose className="w-full py-3 px-5">
                <Link href="/profile" className="flex flex-row items-center gap-4 w-full">
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.picture} alt={user.picture} />
                      <AvatarFallback>{getAvatarFallback(user)}</AvatarFallback>
                    </Avatar>
                  </Button>
                  <div className="text-sm text-gray-900 font-normal leading-6">{user.email}</div>
                </Link>
              </DrawerClose>
            </div>
            <div className="w-full border-t border-[#E2E8F0] min-h-[57px] items-center flex">
              <a href="/api/auth/logout" className="flex items-center justify-between w-full py-3 px-5">
                <div className="flex items-center gap-4">
                  <LogoutIcon />
                  <span className="text-sm text-gray-900">Logout</span>
                </div>
              </a>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function MenuDesktop({ user, children }: { user: Claims; children?: React.ReactNode }) {
  return (
    <div className="items-center justify-end gap-6 hidden sm:flex">
      <div className="flex items-center justify-end gap-4">
        {children}

        <Link
          href="https://discord.gg/QGHxwDsbQQ"
          rel="noopener noreferrer"
          target="_blank"
          className="min-w-12 border border-gray-300 bg-white text-slate-800 flex gap-2 items-center justify-center px-3 py-2 rounded-md shadow-none hover:ring-2 ring-[#CFD1D4] text-sm hover:text-black hover:border-[transparent] transition-all duration-300"
        >
          <DiscordIcon />
        </Link>

        <Link
          href="https://github.com/auth0-lab/market0"
          rel="noopener noreferrer"
          target="_blank"
          className="min-w-12 border border-gray-300 bg-white text-slate-800 flex gap-2 items-center justify-center px-3 py-2 rounded-md shadow-none hover:ring-2 ring-[#CFD1D4] text-sm hover:text-black hover:border-[transparent] transition-all duration-300"
        >
          <GHIcon />
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
  );
}

export function Navbar({ user, children }: { user: Claims; children?: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  return (
    <>
      {!isDesktop && <MenuMobile user={user}>{children}</MenuMobile>}
      {isDesktop && <MenuDesktop user={user}>{children}</MenuDesktop>}
    </>
  );
}
