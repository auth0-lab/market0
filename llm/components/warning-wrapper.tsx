import { cn } from "@/lib/utils";

export default function WarningWrapper({
  children,
  className,
  message,
}: {
  children: React.ReactNode;
  className?: string;
  message?: React.ReactNode;
}) {
  return (
    <div className={cn("p-2 bg-gray-200 flex-1 rounded-3xl", className)}>
      {children}
      <div className="pt-6 pb-5 px-10 text-center">
        {message ? (
          message
        ) : (
          <span className="text-slate-500 text-sm leading-6">
            Data is simulated for illustrative purposes and should not be
            considered as financial advice.
          </span>
        )}
      </div>
    </div>
  );
}
