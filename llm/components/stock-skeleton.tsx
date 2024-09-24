import WarningWrapper from "./warning-wrapper";

export const StockSkeleton = () => {
  return (
    <WarningWrapper className="max-w-xl">
      <div className="p-5 text-green-400 rounded-2xl bg-zinc-950 pt-14 min-h-[192px]">
        <div className="flex flex-row justify-between px-5">
          <div className="flex flex-col gap-2">
            <div className="text-base font-bold text-transparent w-fit bg-zinc-700 rounded-md">
              xxxxx
            </div>
            <div className="text text-xs text-transparent mt-1 bg-zinc-700 w-fit rounded-md">
              xxxxxx xxx xx xxxx xx xxx
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="inline-block px-2 py-1 rounded-md bg-white/10 text-base text-transparent w-fit bg-zinc-700">
              xxx
            </div>
            <div className="text text-xs text-transparent mt-1 bg-zinc-700 w-fit rounded-md">
              xxxxxx xxx xx xxxx
            </div>
          </div>
        </div>

        <div className="-mx-4 relative cursor-col-resize">
          <div style={{ height: 50 }}></div>
        </div>
      </div>
    </WarningWrapper>
  );
};
