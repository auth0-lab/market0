import { sql } from "./sql";

export type ChatUserAccess = "owner" | "can_view";
export type ChatUserStatus = "pending" | "provisioned";

export type ChatUser = {
  id: string;
  chat_id: string;
  email: string;
  user_id?: string;
  access: ChatUserAccess;
  status: ChatUserStatus;
  created_at: Date;
  updated_at: Date;
};

type CreateChatUser = {
  chat_id: string;
  email: string;
  user_id?: string;
  access: ChatUserAccess;
  status?: ChatUserStatus;
};

const mapChatUserFromDB = (chatUser: any): ChatUser => ({
  ...chatUser,
  created_at: new Date(chatUser.created_at),
  updated_at: new Date(chatUser.updated_at),
});

export const add = async ({ chat_id, email, user_id, access, status }: CreateChatUser): Promise<ChatUser> => {
  let result;

  if (!user_id) {
    result = await sql`
    INSERT INTO chat_users (chat_id, email, access, status)
    VALUES (${chat_id}, ${email.toLowerCase()}, ${access}, ${status || "pending"})
    RETURNING *
  `;
  } else {
    result = await sql`
    INSERT INTO chat_users (chat_id, email, user_id, access, status)
    VALUES (${chat_id}, ${email.toLowerCase()}, ${user_id}, ${access}, ${status || "pending"})
    RETURNING *
  `;
  }

  return mapChatUserFromDB(result[0]);
};

export const remove = async (id: string): Promise<void> => {
  await sql`
    DELETE FROM chat_users
    WHERE id = ${id}
  `;
};

export const get = async (id: string): Promise<ChatUser | null> => {
  const result = await sql`
    SELECT * FROM chat_users
    WHERE id = ${id}
  `;

  return result.length > 0 ? mapChatUserFromDB(result[0]) : null;
};

export const getByUserEmail = async (chat_id: string, email: string): Promise<ChatUser | null> => {
  const result = await sql`
    SELECT * FROM chat_users
    WHERE chat_id = ${chat_id} AND email = ${email}
  `;

  return result.length > 0 ? mapChatUserFromDB(result[0]) : null;
};

export const list = async (chat_id: string, { access }: { access?: ChatUserAccess } = {}): Promise<ChatUser[]> => {
  let query = sql`
    SELECT * FROM chat_users
    WHERE chat_id = ${chat_id}
  `;

  if (access) {
    query = sql`
      SELECT * FROM chat_users
      WHERE chat_id = ${chat_id}
      AND access = ${access}
    `;
  }

  const result = await query;
  return result.map(mapChatUserFromDB);
};

export const update = async (
  id: string,
  params: { user_id?: string; access?: ChatUserAccess; status?: ChatUserStatus }
): Promise<ChatUser | null> => {
  const result = await sql`
    UPDATE chat_users
    SET user_id = COALESCE(${params.user_id ?? null}, user_id),
        access = COALESCE(${params.access ?? null}, access),
        status = COALESCE(${params.status ?? null}, status)
    WHERE id = ${id}
    RETURNING *
  `;

  return result.length > 0 ? mapChatUserFromDB(result[0]) : null;
};

export const updateByUserEmail = async (
  chat_id: string,
  email: string,
  params: { user_id?: string; status?: ChatUserStatus }
): Promise<ChatUser | null> => {
  const result = await sql`
    UPDATE chat_users
    SET user_id = COALESCE(${params.user_id ?? null}, user_id),
        status = COALESCE(${params.status ?? null}, status)
    WHERE chat_id = ${chat_id} AND email = ${email}
    RETURNING *
  `;

  return result.length > 0 ? mapChatUserFromDB(result[0]) : null;
};
