import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { z } from "zod";
import { NextResponse } from "next/server";

import { assignChatReader, getChatReaders, revokeChatReader } from "@/sdk/fga";

const MAX_CHAT_READERS = process.env.MAX_CHAT_READERS
  ? parseInt(process.env.MAX_CHAT_READERS, 10)
  : 5;

const bodySchema = z.object({
  emails: z.array(z.string().email().toLowerCase()),
});

export const GET = withApiAuthRequired(
  async (
    request: Request,
    { params }: { params?: Record<string, string | string[]> }
  ): Promise<NextResponse> => {
    const { chatId } = params as { chatId: string };
    const readers = await getChatReaders(chatId);
    return NextResponse.json(readers);
  }
);

export const POST = withApiAuthRequired(
  async (
    request: Request,
    { params }: { params?: Record<string, string | string[]> }
  ): Promise<NextResponse> => {
    const { chatId } = params as { chatId: string };
    const { emails } = bodySchema.parse(await request.json());

    const readers = await getChatReaders(chatId);
    const filteredEmails = emails.filter(
      (email) => !readers.some((reader) => reader.email === email)
    );

    if (readers.length + filteredEmails.length > MAX_CHAT_READERS) {
      return new NextResponse(
        `You have reached the limit (${MAX_CHAT_READERS}) on the number of users that can access to this chat.`,
        { status: 400 }
      );
    }

    await assignChatReader(chatId, filteredEmails);
    return new NextResponse(null, { status: 201 });
  }
);

export const DELETE = withApiAuthRequired(
  async (
    request: Request,
    { params }: { params?: Record<string, string | string[]> }
  ): Promise<NextResponse> => {
    const { chatId } = params as { chatId: string };

    // TO IMPROVE: accept a request body in this DELETE method just to avoid adding the email as part of the url
    const { emails } = bodySchema.parse(await request.json());

    await revokeChatReader(chatId, emails);
    return new NextResponse(null, { status: 204 });
  }
);
