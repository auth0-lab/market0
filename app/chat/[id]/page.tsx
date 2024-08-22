"use client";

import { generateId } from "ai";
import { useActions, useUIState } from "ai/rsc";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ArrowUpIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { menuItems } from "@/lib/examples";
import { cn } from "@/lib/utils";
import { ClientMessage } from "@/llm/types";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  message: z.string().min(2).max(200),
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Chat({ params }: { params: { id: string } }) {
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const input = values.message;
    form.reset();

    setConversation((currentConversation: ClientMessage[]) => [
      ...currentConversation,
      { id: generateId(), role: "user", display: input },
    ]);

    const message = await continueConversation(input);

    setConversation((currentConversation: ClientMessage[]) => [
      ...currentConversation,
      message,
    ]);
  }

  const onExampleClick = (input: string) => async () => {
    setConversation((currentConversation: ClientMessage[]) => [
      ...currentConversation,
      { id: generateId(), role: "user", display: input },
    ]);

    const message = await continueConversation(input);
    setConversation((currentConversation: ClientMessage[]) => [
      ...currentConversation,
      message,
    ]);
  };

  return (
    <main
      className="flex overflow-hidden h-full  mx-auto pt-4"
      style={{ maxHeight: "calc(100vh - 56px)" }}
    >
      <div className="h-full w-full overflow-hidden rounded-md">
        <div className="flex flex-col flex-no-wrap h-full overflow-y-auto overscroll-y-none">
          <div className="flex-1 min-w-0 max-w-4xl mx-auto w-full">
            {conversation.map((message: ClientMessage) =>
              message.role === "user" ? (
                <div
                  key={message.id}
                  className="flex w-full flex-col gap-1 empty:hidden items-end rtl:items-start py-5"
                >
                  <div className="relative max-w-[70%] rounded-3xl bg-[#f4f4f4] px-5 py-2.5 text-stone-600 font-light">
                    {message.display}
                  </div>
                </div>
              ) : message.role === "assistant" ||
                message.role === "function" ? (
                <div key={message.id} className="flex flex-row gap-4 py-5">
                  <div className="border rounded-full h-8 w-8 min-w-8 flex items-center justify-center">
                    <span className="text-xs font-bold">AI</span>
                  </div>
                  <div className="w-full font-light text-stone-600 flex items-center">
                    {message.display}
                  </div>
                </div>
              ) : null
            )}
          </div>
          <div className="sticky bottom-0 flex-shrink-0 min-w-0 min-h-0 bg-white max-w-4xl mx-auto w-full">
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-row justify-between gap-2 items-center"
                >
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="w-full space-y-0">
                        <FormControl>
                          <Input
                            autoFocus
                            autoComplete="off"
                            className="bg-white shadow-none border-0 focus-visible:ring-0 py-2 px-0 placeholder-slate-500/80 text-base font-light"
                            placeholder="Message Market0"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex flex-row gap-2 text-gray-900 text-sm leading-6 bg-gray-200 border-none px-3 py-2 focus-visible:ring-0 hover:bg-gray-300 transition-all duration-300"
                      >
                        Examples <PlusIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-96 p-0"
                      align="end"
                      sideOffset={12}
                    >
                      <DropdownMenuGroup>
                        {menuItems.map((menuItem, idx) => (
                          <DropdownMenuItem
                            key={menuItem.id}
                            onClick={onExampleClick(menuItem.message)}
                            className={cn(
                              "cursor-pointer px-4 py-3 focus:bg-gray-50 rounded-none",
                              idx < menuItems.length - 1 &&
                                "border-b border-gray-900/5"
                            )}
                          >
                            <div className="flex flex-row items-center w-full gap-4">
                              {menuItem.icon}
                              <span className="text-sm text-gray-900 leading-6">
                                {menuItem.message}
                              </span>
                            </div>
                            <ArrowUpIcon />
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    disabled={!form.formState.isDirty}
                    type="submit"
                    className="px-3 py-2 m-0 bg-black hover:bg-black text-white text-sm leading-6"
                  >
                    Send
                  </Button>
                </form>
              </Form>
            </div>
            <div className="relative px-2 py-2 text-center text-sm font-light text-slate-500 md:px-[60px]">
              <span>
                Market0 is a demo that shows how to improve authorization in
                AI-powered apps.
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
