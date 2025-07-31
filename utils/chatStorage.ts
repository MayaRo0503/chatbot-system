import type { Message } from "@/types/chat";

export interface ChatSession {
  botId: string;
  messages: Message[];
  startTime: Date;
  endTime?: Date;
  gender?: "male" | "female";
  isCompleted: boolean;
  isLocked: boolean; // שדה חדש לנעילת שיחה
}

export class ChatStorageManager {
  private static getStorageKey(botId: string): string {
    return `chat_session_${botId}`;
  }

  static saveSession(botId: string, session: ChatSession): void {
    try {
      localStorage.setItem(this.getStorageKey(botId), JSON.stringify(session));
    } catch (error) {
      console.error("Error saving chat session:", error);
    }
  }

  static getSession(botId: string): ChatSession | null {
    try {
      const stored = localStorage.getItem(this.getStorageKey(botId));
      if (!stored) return null;

      const session = JSON.parse(stored);
      // Convert date strings back to Date objects
      session.startTime = new Date(session.startTime);
      if (session.endTime) {
        session.endTime = new Date(session.endTime);
      }
      session.messages = session.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));

      return session;
    } catch (error) {
      console.error("Error loading chat session:", error);
      return null;
    }
  }

  static clearSession(botId: string): void {
    try {
      localStorage.removeItem(this.getStorageKey(botId));
    } catch (error) {
      console.error("Error clearing chat session:", error);
    }
  }

  static markSessionCompleted(botId: string): void {
    const session = this.getSession(botId);
    if (session) {
      session.isCompleted = true;
      session.isLocked = true;
      session.endTime = new Date();
      this.saveSession(botId, session);
    }
  }

  static lockSession(botId: string): void {
    const session = this.getSession(botId);
    if (session) {
      session.isLocked = true;
      this.saveSession(botId, session);
    }
  }

  static unlockSession(botId: string): void {
    const session = this.getSession(botId);
    if (session) {
      session.isLocked = false;
      this.saveSession(botId, session);
    }
  }
}
