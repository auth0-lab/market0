import { WarningPageIcon } from "@/components/icons";

import { PromptUserContainer } from "./prompt-user-container";

export function NotAvailableReadOnly({ message }: { message?: React.ReactNode }) {
  return (
    <PromptUserContainer
      title="Action not available"
      description={message || "You cannot perform actions on read-only mode."}
      icon={
        <div className="bg-gray-200 p-3 rounded-lg flex-wrap">
          <WarningPageIcon />
        </div>
      }
      containerClassName="border-gray-200 border-dashed bg-gray-100"
    />
  );
}
