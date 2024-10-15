"use client";
import { useUIState } from "ai/rsc";
import { groupBy, isEqual } from "lodash-es";
import { DateTime } from "luxon";
import Link from "next/link";
import * as React from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ConversationData } from "@/lib/db/conversations";
import { cn } from "@/lib/utils";
import { listUserConversations } from "@/llm/actions/history";

import { CheckIcon, ChevronUpDownIcon, SimplePlusIcon } from "../icons";
import { useChat } from "./context";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface ConversationPickerProps extends PopoverTriggerProps {
  selectedConversation: ConversationData;
}

const getTitle = (conversation?: ConversationData) => {
  if (!conversation) {
    return;
  }
  return conversation.title ?? `Chat from ${DateTime.fromJSDate(conversation.createdAt).toRelative()}`;
};

const PickerButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="outline"
    role="combobox"
    className={cn(
      // common styles
      "inline-flex items-center justify-between overflow-hidden whitespace-nowrap truncate text-sm",
      // (desktop)
      "sm:max-w-[320px]",
      // (mobile)
      "w-full max-w-[240px]",
      // additional styles provided by user
      className
    )}
    {...props}
  >
    <div className="truncate">{children}</div>
    <ChevronUpDownIcon className="h-4 w-4 ml-2.5" />
  </Button>
));

PickerButton.displayName = "PickerButton";

export default function ConversationPicker({ selectedConversation: initialConversation }: ConversationPickerProps) {
  const [currentConversation] = useUIState();
  const { readOnly } = useChat();
  const [conversations, setConversations] = React.useState<ConversationData[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<ConversationData>(initialConversation);

  React.useEffect(() => {
    const c = conversations.find((c) => c.conversationID === selectedConversation.conversationID);
    if (!c) {
      return;
    }
    setSelectedConversation(c);
  }, [selectedConversation, conversations]);

  const fetchConversations = React.useCallback(async () => {
    let cs = await listUserConversations();
    if (isEqual(cs, conversations)) {
      return;
    }
    setConversations(cs);
  }, [conversations]);

  React.useEffect(() => {
    if (readOnly) {
      return;
    }

    //TODO: we should find a more reliable way to determine when the conversation has finished streaming.
    const userMessages = currentConversation.filter((m: { role: string }) => m.role === "user");
    if (userMessages.length > 4) {
      return;
    }
    (async () => {
      await fetchConversations();
    })();
  }, [selectedConversation, currentConversation, fetchConversations, readOnly]);

  const [open, setOpen] = React.useState(false);

  const groups = groupBy(conversations, (conversation: ConversationData) => {
    return DateTime.fromJSDate(conversation.createdAt).startOf("day").toRelativeCalendar();
  });

  if (readOnly) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PickerButton>{getTitle(selectedConversation)}</PickerButton>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
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
                      {selectedConversation.conversationID === conversation.conversationID && (
                        <CheckIcon className="ml-auto" />
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
                  <Link href="/new" className="flex w-full items-center justify-between">
                    Start new chat
                    <SimplePlusIcon />
                  </Link>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
