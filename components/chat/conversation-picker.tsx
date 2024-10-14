"use client";

import { useUIState } from "ai/rsc";
import { groupBy } from "lodash-es";
import { Check, ChevronsUpDown } from "lucide-react";
import { DateTime } from "luxon";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ConversationData } from "@/lib/db/aiState";
import { listConversations } from "@/llm/actions/history";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface ConversationPickerProps extends PopoverTriggerProps {
  selectedConversationID: string;
}

const getTitle = (conversation?: ConversationData) => {
  if (!conversation) {
    return;
  }
  return conversation.title ?? `Chat from ${DateTime.fromJSDate(conversation.createdAt).toRelative()}`;
};

export default function ConversationPicker({ selectedConversationID }: ConversationPickerProps) {
  const [currentConversation] = useUIState();
  const [conversations, setConversation] = React.useState<ConversationData[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<ConversationData>();

  const fetchConversations = async () => {
    let cs = await listConversations();
    if (!cs.some((c) => c.conversationID === selectedConversationID)) {
      cs = [
        ...cs,
        {
          conversationID: selectedConversationID,
          createdAt: new Date(),
          updatedAt: new Date(),
          userID: "",
          title: "New chat",
        },
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    setConversation(cs);
    setSelectedConversation(cs.find((c) => c.conversationID === selectedConversationID));
  };

  React.useEffect(() => {
    //TODO: we should find a more reliable way to determine when the conversation has finished streaming.
    const userMessages = currentConversation.filter((m: { role: string }) => m.role === "user");
    let i = 0;
    if (userMessages.length > 4) {
      return;
    }
    const poolingInterval = setInterval(async () => {
      i++;
      await fetchConversations();
      if (i === 60) {
        clearInterval(poolingInterval);
      }
    }, 1000);
    return () => clearInterval(poolingInterval);
  }, [selectedConversationID, currentConversation]);

  const [open, setOpen] = React.useState(false);

  const groups = groupBy(conversations, (conversation: ConversationData) => {
    return DateTime.fromJSDate(conversation.createdAt).startOf("day").toRelativeCalendar();
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a team"
          className={`inline-flex items-center justify-between pr-1 pl-2 $border-0 w-[150px] md:w-[320px] overflow-hidden whitespace-nowrap truncate`}
        >
          <div className="truncate">
            <span className="text-sm truncate">{getTitle(selectedConversation)}</span>
            {/* {subtitle && (
                <span className="text-gray-500 font-light text-xs">
                  {typeof subtitle === "string"
                    ? subtitle
                    : subtitle(selectedConversation)}
                </span>
              )} */}
          </div>
          <ChevronsUpDown size={14} className="lucide lucide-chevrons-up-down flex-shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <Command>
          <CommandList>
            <CommandEmpty>No chats found.</CommandEmpty>
          </CommandList>

          <CommandList>
            {Object.entries(groups).map(([day, conversations]) => (
              <CommandGroup key={day} heading={day}>
                {conversations.map((conversation) => (
                  <CommandItem
                    key={conversation.conversationID}
                    onSelect={() => {
                      setSelectedConversation(conversation);
                      setOpen(false);
                    }}
                    className="text-sm"
                    value={conversation.conversationID}
                  >
                    <Link href={`/chat/${conversation.conversationID}`} className="flex w-full items-center">
                      {getTitle(conversation)}
                      {selectedConversationID === conversation.conversationID && (
                        <Check className={"ml-auto h-4 w-4"} />
                      )}
                    </Link>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>

          <>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <CommandItem>
                  <a
                    href="/new"
                    className="flex items-center justify-between gap-3 w-full text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Start new chat
                    <div className="RightSlot">+</div>
                  </a>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
