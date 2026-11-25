import type {
  AdminReply,
  ContactMessage,
  MessageStatus,
} from "@/lib/contact-types";

export interface InboxState {
  messages: ContactMessage[];
  selectedId: string | null;
  searchQuery: string;
  statusFilter: "All" | MessageStatus;
}

export type InboxAction =
  | { type: "SET_MESSAGES"; messages: ContactMessage[] }
  | { type: "SELECT_MESSAGE"; id: string | null }
  | { type: "SET_SEARCH"; query: string }
  | { type: "SET_FILTER"; filter: "All" | MessageStatus }
  | { type: "OPTIMISTIC_ADD_REPLY"; messageId: string; reply: AdminReply }
  | {
      type: "CONFIRM_REPLY";
      messageId: string;
      tempId: string;
      confirmed: AdminReply;
      updatedStatus?: MessageStatus;
    }
  | { type: "ROLLBACK_REPLY"; messageId: string; tempId: string }
  | { type: "OPTIMISTIC_STATUS"; messageId: string; status: MessageStatus }
  | { type: "ROLLBACK_STATUS"; messageId: string; previousStatus: MessageStatus }
  | { type: "OPTIMISTIC_DELETE"; messageId: string }
  | { type: "RESTORE_MESSAGE"; message: ContactMessage; index: number }
  | { type: "MERGE_MESSAGE_DETAIL"; message: ContactMessage };

export function inboxReducer(state: InboxState, action: InboxAction): InboxState {
  switch (action.type) {
    case "SET_MESSAGES": {
      const hasSelected =
        state.selectedId !== null &&
        action.messages.some((m) => m.id === state.selectedId);
      return {
        ...state,
        messages: action.messages,
        selectedId: hasSelected
          ? state.selectedId
          : (action.messages[0]?.id ?? null),
      };
    }

    case "SELECT_MESSAGE":
      return { ...state, selectedId: action.id };

    case "SET_SEARCH":
      return { ...state, searchQuery: action.query };

    case "SET_FILTER":
      return { ...state, statusFilter: action.filter };

    case "OPTIMISTIC_ADD_REPLY":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.messageId
            ? {
                ...msg,
                replies: [...msg.replies, action.reply],
              }
            : msg
        ),
      };

    case "CONFIRM_REPLY":
      return {
        ...state,
        messages: state.messages.map((msg) => {
          if (msg.id !== action.messageId) return msg;
          return {
            ...msg,
            status: action.updatedStatus ?? msg.status,
            updatedAt: action.confirmed.createdAt,
            replies: msg.replies.map((r) =>
              r.id === action.tempId ? { ...action.confirmed, pending: false } : r
            ),
          };
        }),
      };

    case "ROLLBACK_REPLY":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.messageId
            ? {
                ...msg,
                replies: msg.replies.filter((r) => r.id !== action.tempId),
              }
            : msg
        ),
      };

    case "OPTIMISTIC_STATUS":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.messageId ? { ...msg, status: action.status } : msg
        ),
      };

    case "ROLLBACK_STATUS":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.messageId
            ? { ...msg, status: action.previousStatus }
            : msg
        ),
      };

    case "OPTIMISTIC_DELETE": {
      const remaining = state.messages.filter((m) => m.id !== action.messageId);
      return {
        ...state,
        messages: remaining,
        selectedId:
          state.selectedId === action.messageId
            ? (remaining[0]?.id ?? null)
            : state.selectedId,
      };
    }

    case "RESTORE_MESSAGE": {
      if (state.messages.some((m) => m.id === action.message.id)) {
        return state;
      }
      const next = [...state.messages];
      const clampedIndex = Math.max(0, Math.min(action.index, next.length));
      next.splice(clampedIndex, 0, action.message);
      return {
        ...state,
        messages: next,
        selectedId: state.selectedId ?? action.message.id,
      };
    }

    case "MERGE_MESSAGE_DETAIL":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.message.id ? action.message : m
        ),
      };

    default:
      return state;
  }
}

/**
 * Pure client-side filtering so search and status filter updates are instantaneous
 * without firing redundant Worker API calls.
 */
export function filterMessages(
  messages: ContactMessage[],
  statusFilter: "All" | MessageStatus,
  searchQuery: string
): ContactMessage[] {
  const q = searchQuery.trim().toLowerCase();
  return messages.filter((msg) => {
    if (statusFilter !== "All" && msg.status !== statusFilter) {
      return false;
    }
    if (!q) return true;
    return (
      msg.name.toLowerCase().includes(q) ||
      msg.email.toLowerCase().includes(q) ||
      msg.message.toLowerCase().includes(q) ||
      msg.replies.some((r) => r.body.toLowerCase().includes(q))
    );
  });
}

/**
 * Reusable optimistic mutation runner:
 * 1. Applies optimistic UI update synchronously.
 * 2. Executes async persistence request.
 * 3. Calls onCommit on success, or onRollback + returns error on failure.
 */
export async function runOptimisticMutation<T>(options: {
  applyOptimistic: () => void;
  commit: () => Promise<T>;
  onSuccess?: (result: T) => void;
  rollback: () => void;
}): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  options.applyOptimistic();
  try {
    const result = await options.commit();
    options.onSuccess?.(result);
    return { ok: true, data: result };
  } catch (err) {
    options.rollback();
    const message =
      err instanceof Error ? err.message : "Request failed. Changes reverted.";
    return { ok: false, error: message };
  }
}
