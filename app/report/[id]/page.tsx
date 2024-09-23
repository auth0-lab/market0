"use server";

import Markdown from "react-markdown";

import { documents } from "@/lib/db";
import { withFGA } from "@/sdk/fga";
import { withCheckPermission } from "@/sdk/fga/next/with-check-permission";

async function Report({ params }: { params: { id: string } }) {
  const document = await documents.getByID(params.id);
  return (
    <main
      className="flex overflow-hidden h-full  mx-auto pt-4"
      style={{ maxHeight: "calc(100vh - 56px)" }}
    >
      <div className="h-full w-full overflow-hidden rounded-md">
        <div className="flex flex-col flex-no-wrap h-full overflow-y-auto overscroll-y-none">
          <div className="flex-1 min-w-0 max-w-4xl mx-auto w-full"></div>
          <div className="flex flex-col max-w-4xl mx-auto w-full mb-5">
            <h2 className="text-2xl font-bold tracking-tight">
              {document.metadata.title}
            </h2>
            <Markdown className="markdown">{document.content}</Markdown>
          </div>
        </div>
      </div>
    </main>
  );
}

export default withCheckPermission(
  {
    checker: ({ params }) =>
      withFGA({
        object: `doc:${params.id}`,
        relation: "can_view",
      }),
  },
  Report
);
