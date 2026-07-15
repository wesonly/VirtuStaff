/**
 * VirtuStaff — AI Memory Management
 *
 * Manages short-term (conversation) and long-term (persistent) memory
 * for AI employees to maintain context across interactions.
 */

export interface MemoryEntry {
  key: string;
  value: string;
  type: 'fact' | 'preference' | 'context';
  expiresAt?: Date;
}

/**
 * In-memory conversation store (ephemeral, per-session).
 * TODO: Replace with Redis-based storage for production.
 */
class ConversationMemory {
  private sessions = new Map<string, MemoryEntry[]>();

  add(sessionId: string, entry: MemoryEntry): void {
    const existing = this.sessions.get(sessionId) || [];
    existing.push(entry);
    this.sessions.set(sessionId, existing);
  }

  get(sessionId: string): MemoryEntry[] {
    return this.sessions.get(sessionId) || [];
  }

  clear(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}

export const conversationMemory = new ConversationMemory();