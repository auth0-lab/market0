export function UnauthorizedError({ children }: { children?: React.ReactNode }) {
  // TODO: improve UI for this error
  return (
    <main className="flex overflow-hidden h-full  mx-auto pt-4" style={{ maxHeight: "calc(100vh - 56px)" }}>
      <div className="h-full w-full overflow-hidden rounded-md">
        <div className="flex flex-col flex-no-wrap h-full overflow-y-auto overscroll-y-none">
          <div className="flex flex-col max-w-4xl mx-auto w-full mb-5">
            {children || "You are not authorized to access the requested information."}
          </div>
        </div>
      </div>
    </main>
  );
}
