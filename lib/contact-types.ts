export type MessageStatus = "New" | "Replied" | "Closed";

export const MESSAGE_STATUSES: readonly MessageStatus[] = [
  "New",
  "Replied",
  "Closed",
] as const;

export interface AdminReply {
  id: string;
  messageId: string;
  body: string;
  createdAt: string;
  /** True while an optimistic reply is awaiting Worker + D1 confirmation */
  pending?: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  replies: AdminReply[];
}

export interface ContactSubmitPayload {
  name: string;
  email: string;
  message: string;
  /** Optional honeypot field */
  company?: string;
}

export interface ContactSubmitResponse {
  ok: boolean;
  id?: string;
  createdAt?: string;
  error?: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
