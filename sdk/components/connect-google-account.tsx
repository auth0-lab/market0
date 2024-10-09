"use client";

export const ConnectGoogleAccount = ({
  title,
  description,
  api,
}: {
  title: string;
  description: string;
  api: string;
}) => {
  return (
    <div className="border border-gray-300 rounded-lg items-center w-full justify-between p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-0">
      <div className="flex flex-col gap-1 sm:gap-1.5">
        <h2 className="text-sm sm:text-base leading-6 font-semibold">{title}</h2>
        <p className="text-xs sm:text-sm leading-5 font-light text-gray-500">{description}</p>
      </div>
      <div className="w-full sm:w-fit">
        <a
          href={`/api/auth/login?3rdPartyApi=${api}&linkWith=google-oauth2&returnTo=${window.location.pathname}`}
          className="w-full sm:w-fit inline-block text-center bg-gray-200 text-black whitespace-nowrap rounded-md text-sm font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 hover:text-white py-2 px-4"
        >
          Connect
        </a>
      </div>
    </div>
  );
};
