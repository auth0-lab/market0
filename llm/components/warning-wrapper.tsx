import { cn } from "@/lib/utils";

export default function WarningWrapper({
  children,
  className,
  message,
  readOnly = false,
}: {
  children: React.ReactNode;
  className?: string;
  message?: React.ReactNode;
  readOnly?: boolean;
}) {
  return (
    <fieldset
      className={cn(
        "p-2 bg-gray-200 flex-1 rounded-3xl",
        { "diabled [&>*]:opacity-80 grayscale [&_*]:cursor-not-allowed": readOnly },
        className
      )}
      disabled={readOnly}
    >
      {children}
      <div className="pt-3 pb-3 px-2 sm:px-10 text-center !opacity-100">
        {message ? (
          message
        ) : (
          <span className="text-slate-500 text-xs sm:text-sm leading-6 !opacity-100">
            Data was randomly generated for illustrative purposes
          </span>
        )}
      </div>
    </fieldset>
  );
}
