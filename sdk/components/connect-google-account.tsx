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
    <div className="border border-gray-300 rounded-lg p-6 flex items-center w-full justify-between">
      <div className="flex flex-col gap-2">
        <h2 className="text-base leading-6 font-semibold">{title}</h2>
        <p className="text-sm leading-5 font-light text-gray-500">
          {description}
        </p>
      </div>
      <div>
        <a
          href={`/api/auth/login?3rd_party_api=${api}&return_to=${window.location.pathname}`}
          className="bg-gray-200 text-black whitespace-nowrap rounded-md text-sm font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 hover:text-white py-2 px-4"
        >
          Connect
        </a>
      </div>
    </div>
  );
};
