"use client";

import { ArrowUpIcon, ChevronRightIcon, CloseIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { menuItems } from "@/lib/examples";
import { cn } from "@/lib/utils";

function ExamplesDesktop({ onExampleClick }: { onExampleClick: (input: string) => () => Promise<void> }) {
  return (
    <div className="hidden sm:inline-block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex flex-row gap-2 text-black text-sm leading-6 bg-gray-100 border-none px-3 py-2 focus-visible:ring-0 hover:bg-gray-200/90 transition-all duration-300 shadow-none font-light"
          >
            Examples
            <ChevronRightIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-96 p-0" align="end" sideOffset={8}>
          <DropdownMenuGroup>
            {menuItems.map((menuItem, idx) => (
              <DropdownMenuItem
                key={menuItem.id}
                onClick={onExampleClick(menuItem.message)}
                className={cn(
                  "cursor-pointer px-4 py-3 focus:bg-gray-50 rounded-none",
                  idx < menuItems.length - 1 && "border-b border-gray-900/5"
                )}
              >
                <div className="flex flex-row items-center w-full gap-4">
                  {menuItem.icon}
                  <span className="text-sm text-gray-900 leading-6">{menuItem.message}</span>
                </div>
                <ArrowUpIcon />
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ExamplesMobile({ onExampleClick }: { onExampleClick: (input: string) => () => Promise<void> }) {
  return (
    <div className="sm:hidden flex items-center">
      <Drawer direction="left">
        <DrawerTrigger asChild={true}>
          <Button
            variant="outline"
            className="flex flex-row gap-2 text-black text-sm leading-6 bg-gray-100 border-none px-3 py-2 focus-visible:ring-0 hover:bg-gray-200/90 transition-all duration-300 shadow-none font-light"
          >
            <ArrowUpIcon />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-full rounded-none">
          <DrawerHeader>
            <DrawerTitle className="px-1">
              <div className="flex justify-between items-center">
                <div className="text-base font-medium leading-6">Examples</div>

                <DrawerClose>
                  <Button variant="ghost" className="p-0">
                    <CloseIcon />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerTitle>
          </DrawerHeader>
          <ul>
            {menuItems.map((menuItem, idx) => (
              <li key={menuItem.id} className="border-t last:border-b border-[#E2E8F0]">
                <DrawerClose className="w-full">
                  <button
                    onClick={onExampleClick(menuItem.message)}
                    className="flex items-center justify-between py-3 px-5 w-full"
                  >
                    <div className="flex items-center gap-4">
                      {menuItem.icon}
                      <span className="text-sm text-gray-900">{menuItem.message}</span>
                    </div>
                    <ArrowUpIcon />
                  </button>
                </DrawerClose>
              </li>
            ))}
          </ul>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export function Examples({ onExampleClick }: { onExampleClick: (input: string) => () => Promise<void> }) {
  return (
    <>
      <ExamplesDesktop onExampleClick={onExampleClick} />
      <ExamplesMobile onExampleClick={onExampleClick} />
    </>
  );
}
