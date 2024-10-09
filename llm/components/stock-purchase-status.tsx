import { CancelRedIcon, CheckGreenIcon } from "@/components/icons";

export const StockPurchaseStatus = ({
  message,
  status,
}: {
  message: string;
  status?: "in-progress" | "success" | "failure";
}) => (
  <div className="flex flex-row gap-4 items-center">
    {status === "failure" && <CancelRedIcon />}
    {status === "success" && <CheckGreenIcon />}
    {status === "in-progress" && (
      <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full" />
    )}
    <p>{message}</p>
  </div>
);
