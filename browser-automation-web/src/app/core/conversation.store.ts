const CONVERSATION_KEY = 'baa_conversation_id';

export class ConversationStore {
  static getId(): string | null {
    return localStorage.getItem(CONVERSATION_KEY);
  }

  static setId(id: string): void {
    localStorage.setItem(CONVERSATION_KEY, id);
  }

  static clear(): void {
    localStorage.removeItem(CONVERSATION_KEY);
  }
}
