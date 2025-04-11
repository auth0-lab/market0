"use client";
import { useUIState } from "ai/rsc";
import { formatDistance, formatRelative, startOfDay } from "date-fns";
import { groupBy, isEqual } from "lodash-es";
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
  return conversation.title ?? `Chat from ${formatDistance(conversation.createdAt, new Date(), { addSuffix: true })}`;
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
      "sm:w-[320px]",
      // (mobile)
      "w-[220px]",
      "border border-gray-300 shadow-none hover:bg-white hover:ring-[#CFD1D4] hover:ring-1 transition-all duration-300",
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
    const c = conversations.find((c) => c.id === selectedConversation.id);
    if (!c) {
      return;
    }
    setSelectedConversation(c);
  }, [selectedConversation, conversations]);

  const updateConversationList = React.useCallback(async () => {
    const userMessages = currentConversation.filter((m: { role: string }) => m.role === "user");
    if (userMessages.length > 4 && conversations.length > 1) {
      return;
    }
    let cs = await listUserConversations();
    if (isEqual(cs, conversations)) {
      return;
    }
    setConversations(cs ?? []);
  }, [conversations, currentConversation]);

  React.useEffect(() => {
    if (readOnly) {
      return;
    }
    //TODO: we should find a more reliable way to determine when the conversation has finished streaming.
    (async () => {
      await updateConversationList();
    })();
  }, [updateConversationList, readOnly]);

  const [open, setOpen] = React.useState(false);

  const groups = groupBy(conversations, (conversation: ConversationData) => {
    // TODO: https://github.com/date-fns/date-fns/issues/1218
    return formatRelative(startOfDay(conversation.createdAt), new Date()).split(" at ")[0].toLowerCase();
  });

  if (readOnly) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PickerButton>{getTitle(selectedConversation)}</PickerButton>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] sm:w-[320px] p-0" align="end">
        <Command>
          <CommandList>
            <CommandEmpty>No chats found.</CommandEmpty>
          </CommandList>

          <CommandList>
            {Object.entries(groups).map(([day, conversations]) => (
              <CommandGroup key={day} heading={day}>
                {conversations.map((conversation) => (
                  <CommandItem key={conversation.id} className="text-sm" value={conversation.id}>
                    <a href={`/chat/${conversation.id}`} className="flex w-full items-center">
                      <span className="truncate">{getTitle(conversation)}</span>
                      {selectedConversation.id === conversation.id && <CheckIcon className="ml-auto" />}
                    </a>
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
                  <a href="/new" className="flex w-full items-center justify-between">
                    Start new chat
                    <SimplePlusIcon />
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
