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
      <div className="pt-3 pb-3 px-10 text-center">
        {message ? (
          message
        ) : (
          <span className="text-slate-500 text-sm leading-6">
            Data is simulated for demo purposes.
          </span>
        )}
      </div>
    </div>
  );
}
