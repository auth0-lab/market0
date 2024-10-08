import { cn } from "@/lib/utils";

export default function Loader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center w-full ml-4", className)}>
      <div className="animate-dots-loader w-[5px]" style={{ borderRadius: "50%", aspectRatio: 1 }} />
    </div>
  );
}
