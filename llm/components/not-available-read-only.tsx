import { WarningPageIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

import { PromptUserContainer } from "./prompt-user-container";

export function NotAvailableReadOnly({
  message,
  containerClassName,
}: {
  message?: React.ReactNode;
  containerClassName?: string;
}) {
  return (
    <PromptUserContainer
      title="Action not available"
      description={message || "You cannot perform actions on read-only mode."}
      icon={
        <div className="bg-gray-200 p-3 rounded-lg flex-wrap">
          <WarningPageIcon />
        </div>
      }
      containerClassName={cn("border-gray-200 border-dashed bg-gray-100", containerClassName)}
    />
  );
}
