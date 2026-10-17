/** RFC 4122 UUID (all versions). */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Legacy MongoDB ObjectId — still readable until data is migrated. */
const LEGACY_OBJECT_ID_RE = /^[0-9a-f]{24}$/i;

export const NEW_CHAT_PATH = '/app/chat';

export function isValidConversationId(id: string): boolean {
  const trimmed = id.trim();
  return UUID_RE.test(trimmed) || LEGACY_OBJECT_ID_RE.test(trimmed);
}

export function isUuidConversationId(id: string): boolean {
  return UUID_RE.test(id.trim());
}

export function conversationUrl(id: string): string {
  return `/c/${id}`;
}

export function conversationCommands(id: string): string[] {
  return ['/c', id];
}
