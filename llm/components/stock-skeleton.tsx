import WarningWrapper from "./warning-wrapper";

export const StockSkeleton = () => {
  return (
    <WarningWrapper>
      <div className="p-4 text-green-400 rounded-2xl bg-zinc-950 pt-14 min-h-[310px]">
        <div className="flex flex-row justify-between px-10">
          <div className="flex flex-col gap-2">
            <div className="text-xl font-bold text-transparent w-fit bg-zinc-700 rounded-md">
              xxxxx
            </div>
            <div className="text text-xs text-transparent mt-1 bg-zinc-700 w-fit rounded-md">
              xxxxxx xxx xx xxxx xx xxx
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="inline-block px-2 py-1 rounded-md bg-white/10 text-xl text-transparent w-fit bg-zinc-700">
              xxx
            </div>
            <div className="text text-xs text-transparent mt-1 bg-zinc-700 w-fit rounded-md">
              xxxxxx xxx xx xxxx
            </div>
          </div>
        </div>

        <div className="-mx-4 relative cursor-col-resize">
          <div style={{ height: 146 }}></div>
        </div>
      </div>
    </WarningWrapper>
  );
};
