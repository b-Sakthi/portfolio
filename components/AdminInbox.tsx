"use client";

import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  MESSAGE_STATUSES,
  type ContactMessage,
  type MessageStatus,
} from "@/lib/contact-types";
import {
  filterMessages,
  inboxReducer,
  runOptimisticMutation,
  type InboxState,
} from "@/lib/optimistic-inbox";
import { siteConfig } from "@/lib/site-config";
import {
  createAdminReply,
  deleteAdminMessage,
  fetchAdminMessages,
  logoutAdmin,
  updateMessageStatus,
  verifyAdminToken,
} from "@/lib/worker-api";

const initialInboxState: InboxState = {
  messages: [],
  selectedId: null,
  searchQuery: "",
  statusFilter: "All",
};

const statusBadgeStyles: Record<MessageStatus, string> = {
  New: "bg-[#F5D90A] text-[#0B0B0B]",
  Replied: "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  Closed: "border border-[#383838] bg-[#1F1F1F] text-[#A1A1AA]",
};

export function AdminInbox() {
  const tokenInputId = useId();
  const searchInputId = useId();
  const replyInputId = useId();
  const statusSelectId = useId();
  const deleteDialogTitleId = useId();

  const [tokenInput, setTokenInput] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");

  const [state, dispatch] = useReducer(inboxReducer, initialInboxState);
  const [loadingInbox, setLoadingInbox] = useState<boolean>(false);
  const [banner, setBanner] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  // Mobile detail view toggle so narrow screens show either list or thread cleanly
  const [mobileShowDetail, setMobileShowDetail] = useState<boolean>(false);

  // Reply composer state
  const [replyDraft, setReplyDraft] = useState<string>("");
  const replyingMessageIdsRef = useRef<Set<string>>(new Set());
  const [replySubmittingId, setReplySubmittingId] = useState<string | null>(
    null
  );

  // Delete confirmation dialog state
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null);
  const [pendingDeleteTarget, setPendingDeleteTarget] =
    useState<ContactMessage | null>(null);

  const loadMessages = useCallback(async () => {
    setLoadingInbox(true);
    setBanner(null);
    try {
      const messages = await fetchAdminMessages();
      dispatch({ type: "SET_MESSAGES", messages });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load messages.";
      if (msg === "Unauthorized") {
        setIsAuthenticated(false);
        setAuthError("Session expired or unauthorized. Please sign in again.");
      } else {
        setBanner({ type: "error", text: msg });
      }
    } finally {
      setLoadingInbox(false);
    }
  }, []);

  // Check existing HttpOnly cookie session on mount if Worker URL is configured
  useEffect(() => {
    if (!siteConfig.workerUrl) return;
    let active = true;
    void (async () => {
      try {
        const messages = await fetchAdminMessages();
        if (!active) return;
        setIsAuthenticated(true);
        dispatch({ type: "SET_MESSAGES", messages });
      } catch {
        // Not authenticated yet; stay on sign-in screen
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const candidate = tokenInput.trim();
    if (!candidate) {
      setAuthError("Please enter your admin token.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    try {
      const result = await verifyAdminToken(candidate);
      if (!result.ok) {
        setAuthError(result.error || "Invalid credentials.");
        return;
      }
      setTokenInput("");
      setIsAuthenticated(true);
      await loadMessages();
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : "Unable to verify credentials with Worker."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutAdmin();
    } catch {
      // Ignore network failure during logout cleanup
    }
    setIsAuthenticated(false);
    dispatch({ type: "SET_MESSAGES", messages: [] });
    setBanner(null);
  };

  const filteredMessages = useMemo(
    () =>
      filterMessages(state.messages, state.statusFilter, state.searchQuery),
    [state.messages, state.statusFilter, state.searchQuery]
  );

  const selectedMessage = useMemo(
    () => state.messages.find((m) => m.id === state.selectedId) ?? null,
    [state.messages, state.selectedId]
  );

  const handleOpenMessage = (id: string) => {
    // Immediate UI display from already-loaded state (no redundant fetch)
    dispatch({ type: "SELECT_MESSAGE", id });
    setMobileShowDetail(true);
    setBanner(null);
  };

  const handleStatusChange = async (
    message: ContactMessage,
    nextStatus: MessageStatus
  ) => {
    if (message.status === nextStatus) return;
    const previousStatus = message.status;
    setBanner(null);

    const result = await runOptimisticMutation({
      applyOptimistic: () => {
        dispatch({
          type: "OPTIMISTIC_STATUS",
          messageId: message.id,
          status: nextStatus,
        });
      },
      commit: () => updateMessageStatus(message.id, nextStatus),
      rollback: () => {
        dispatch({
          type: "ROLLBACK_STATUS",
          messageId: message.id,
          previousStatus,
        });
      },
    });

    if (!result.ok) {
      setBanner({
        type: "error",
        text: `Could not update status to ${nextStatus}: ${result.error}`,
      });
    }
  };

  const handleReplySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMessage) return;

    const trimmed = replyDraft.trim();
    if (!trimmed) return;

    // Prevent accidental duplicate replies while a reply for this message is saving
    if (replyingMessageIdsRef.current.has(selectedMessage.id)) {
      return;
    }

    const targetMessageId = selectedMessage.id;
    const tempId = `temp-${crypto.randomUUID()}`;
    const clientReplyId = crypto.randomUUID();
    const savedDraft = replyDraft;

    replyingMessageIdsRef.current.add(targetMessageId);
    setReplySubmittingId(targetMessageId);
    setReplyDraft("");
    setBanner(null);

    const optimisticReply = {
      id: tempId,
      messageId: targetMessageId,
      body: trimmed,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    const result = await runOptimisticMutation({
      applyOptimistic: () => {
        dispatch({
          type: "OPTIMISTIC_ADD_REPLY",
          messageId: targetMessageId,
          reply: optimisticReply,
        });
      },
      commit: () =>
        createAdminReply(targetMessageId, trimmed, clientReplyId),
      onSuccess: (confirmed) => {
        dispatch({
          type: "CONFIRM_REPLY",
          messageId: targetMessageId,
          tempId,
          confirmed: confirmed.reply,
          updatedStatus: confirmed.status,
        });
      },
      rollback: () => {
        dispatch({
          type: "ROLLBACK_REPLY",
          messageId: targetMessageId,
          tempId,
        });
        setReplyDraft(savedDraft);
      },
    });

    replyingMessageIdsRef.current.delete(targetMessageId);
    setReplySubmittingId(null);

    if (!result.ok) {
      setBanner({
        type: "error",
        text: `Reply failed to save and was rolled back: ${result.error}`,
      });
    }
  };

  const requestDelete = (message: ContactMessage) => {
    setPendingDeleteTarget(message);
    deleteDialogRef.current?.showModal();
  };

  const cancelDelete = () => {
    deleteDialogRef.current?.close();
    setPendingDeleteTarget(null);
  };

  const confirmDelete = async () => {
    const target = pendingDeleteTarget;
    deleteDialogRef.current?.close();
    setPendingDeleteTarget(null);
    if (!target) return;

    const originalIndex = state.messages.findIndex((m) => m.id === target.id);
    setBanner(null);
    setMobileShowDetail(false);

    const result = await runOptimisticMutation({
      applyOptimistic: () => {
        dispatch({ type: "OPTIMISTIC_DELETE", messageId: target.id });
      },
      commit: () => deleteAdminMessage(target.id),
      rollback: () => {
        dispatch({
          type: "RESTORE_MESSAGE",
          message: target,
          index: originalIndex === -1 ? 0 : originalIndex,
        });
      },
    });

    if (!result.ok) {
      setBanner({
        type: "error",
        text: `Failed to delete message (restored): ${result.error}`,
      });
    } else {
      setBanner({
        type: "success",
        text: `Deleted message from ${target.name}.`,
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-md py-12">
        <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8">
          <div className="flex items-center gap-2.5 text-[#F5D90A]">
            <Lock className="h-5 w-5" aria-hidden="true" />
            <span className="font-mono-code text-xs uppercase tracking-wider">
              Protected Admin Inbox
            </span>
          </div>
          <h1 className="text-project mt-3 text-[#F5F5F0]">Admin Sign In</h1>
          <p className="mt-2 text-sm text-[#A1A1AA]">
            Authenticate with your Worker{" "}
            <code className="font-mono-code text-xs text-[#F5F5F0]">
              ADMIN_TOKEN
            </code>{" "}
            to manage D1 contact submissions.
          </p>

          {!siteConfig.workerUrl && (
            <p
              role="alert"
              className="mt-4 rounded-[8px] border border-yellow-400/40 bg-yellow-400/10 p-3 text-xs text-yellow-200"
            >
              NEXT_PUBLIC_WORKER_URL is not configured. Set it to your
              Cloudflare Worker URL (e.g. http://127.0.0.1:8787) before signing
              in.
            </p>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor={tokenInputId}
                className="mb-2 block text-sm font-medium text-[#F5F5F0]"
              >
                Admin Token
              </label>
              <input
                id={tokenInputId}
                type="password"
                autoComplete="current-password"
                required
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter server-side ADMIN_TOKEN"
                className="min-h-[48px] w-full rounded-[8px] border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-3 text-base text-[#F5F5F0] placeholder:text-[#71717A] focus:border-[#F5D90A]"
              />
            </div>

            {authError && (
              <p
                role="alert"
                className="rounded-[8px] border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200"
              >
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[8px] bg-[#F5D90A] px-5 py-3 font-display text-sm font-bold text-[#0B0B0B] transition-colors hover:bg-[#FFE524] disabled:opacity-70"
            >
              {authLoading ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Unlock Inbox</span>
              )}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#242424] pb-6">
        <div>
          <span className="font-mono-code text-meta text-[#F5D90A]">
            D1 Contact Inbox
          </span>
          <h1 className="text-section mt-1 text-[#F5F5F0]">
            Messages ({state.messages.length})
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/analytics/"
            prefetch={false}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-sm font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            <span>Analytics</span>
          </Link>

          <button
            type="button"
            onClick={() => void loadMessages()}
            disabled={loadingInbox}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-sm font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A] disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingInbox ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-sm font-medium text-[#A1A1AA] transition-colors hover:border-red-500/50 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      <div aria-live="polite" className="min-h-[4px]">
        {banner && (
          <div
            role={banner.type === "error" ? "alert" : "status"}
            className={`flex items-center justify-between gap-3 rounded-[12px] border p-4 text-sm ${
              banner.type === "error"
                ? "border-red-500/40 bg-red-500/10 text-red-200"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {banner.type === "error" ? (
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span>{banner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="text-xs underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Controls (Client-Side Instant) */}
      <div className="flex flex-col gap-4 rounded-[16px] border border-[#242424] bg-[#141414] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <label htmlFor={searchInputId} className="visually-hidden">
            Search messages
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]"
            aria-hidden="true"
          />
          <input
            id={searchInputId}
            type="search"
            value={state.searchQuery}
            onChange={(e) =>
              dispatch({ type: "SET_SEARCH", query: e.target.value })
            }
            placeholder="Search by sender, email, message, or reply..."
            className="min-h-[44px] w-full rounded-[8px] border border-[#2A2A2A] bg-[#0B0B0B] py-2 pr-4 pl-10 text-sm text-[#F5F5F0] placeholder:text-[#71717A] focus:border-[#F5D90A]"
          />
        </div>

        <div
          role="group"
          aria-label="Filter messages by status"
          className="flex flex-wrap gap-2"
        >
          {(["All", ...MESSAGE_STATUSES] as const).map((filter) => {
            const active = state.statusFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={active}
                onClick={() => dispatch({ type: "SET_FILTER", filter })}
                className={`min-h-[40px] rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-[#F5D90A] text-[#0B0B0B]"
                    : "border border-[#2A2A2A] bg-[#0B0B0B] text-[#A1A1AA] hover:border-[#F5D90A] hover:text-[#F5F5F0]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Pane */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Message List */}
        <div
          className={`lg:col-span-5 ${mobileShowDetail ? "hidden lg:block" : "block"}`}
        >
          <div className="rounded-[16px] border border-[#242424] bg-[#141414]">
            {loadingInbox && state.messages.length === 0 ? (
              <div className="flex items-center justify-center gap-2 p-10 text-sm text-[#A1A1AA]">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Loading messages...</span>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#A1A1AA]">
                No messages match your current filter.
              </div>
            ) : (
              <ul className="divide-y divide-[#242424]">
                {filteredMessages.map((msg) => {
                  const isSelected = msg.id === state.selectedId;
                  return (
                    <li key={msg.id}>
                      <button
                        type="button"
                        onClick={() => handleOpenMessage(msg.id)}
                        className={`flex w-full flex-col gap-2 p-4 text-left transition-colors hover:bg-[#1B1B1B] ${
                          isSelected ? "bg-[#1B1B1B] ring-1 ring-inset ring-[#F5D90A]/50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display text-sm font-bold text-[#F5F5F0]">
                            {msg.name}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeStyles[msg.status]}`}
                          >
                            {msg.status}
                          </span>
                        </div>
                        <span className="text-xs text-[#A1A1AA]">
                          {msg.email}
                        </span>
                        <p className="line-clamp-2 text-xs leading-relaxed text-[#A1A1AA]">
                          {msg.message}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                          <span>
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            {msg.replies.length}{" "}
                            {msg.replies.length === 1 ? "reply" : "replies"}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Message Detail & Internal Reply Thread */}
        <div
          className={`lg:col-span-7 ${mobileShowDetail ? "block" : "hidden lg:block"}`}
        >
          {selectedMessage ? (
            <article className="rounded-[16px] border border-[#242424] bg-[#141414] p-5 sm:p-7">
              <div className="mb-4 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileShowDetail(false)}
                  className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#F5D90A]"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Back to Inbox</span>
                </button>
              </div>

              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#242424] pb-5">
                <div>
                  <h2 className="text-project text-[#F5F5F0]">
                    {selectedMessage.name}
                  </h2>
                  <p className="mt-1 text-sm text-[#A1A1AA]">
                    {selectedMessage.email} ·{" "}
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label htmlFor={statusSelectId} className="visually-hidden">
                      Message status
                    </label>
                    <select
                      id={statusSelectId}
                      value={selectedMessage.status}
                      onChange={(e) =>
                        void handleStatusChange(
                          selectedMessage,
                          e.target.value as MessageStatus
                        )
                      }
                      className="min-h-[44px] rounded-[8px] border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm font-medium text-[#F5F5F0] focus:border-[#F5D90A]"
                    >
                      {MESSAGE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => requestDelete(selectedMessage)}
                    aria-label={`Delete message from ${selectedMessage.name}`}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-red-500/30 bg-[#0B0B0B] px-3.5 py-2 text-sm font-medium text-red-300 transition-colors hover:border-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Visitor Message Body */}
              <div className="mt-5 rounded-[12px] border border-[#242424] bg-[#0B0B0B] p-4 sm:p-5">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#F5F5F0] sm:text-base">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Internal Admin Replies */}
              <div className="mt-6">
                <h3 className="font-mono-code text-xs uppercase tracking-wider text-[#A1A1AA]">
                  Internal Notes &amp; Replies ({selectedMessage.replies.length})
                </h3>

                {selectedMessage.replies.length > 0 ? (
                  <ul className="mt-3 space-y-3">
                    {selectedMessage.replies.map((reply) => (
                      <li
                        key={reply.id}
                        className={`rounded-[12px] border p-4 ${
                          reply.pending
                            ? "border-[#F5D90A]/40 bg-[#F5D90A]/5"
                            : "border-[#242424] bg-[#0B0B0B]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs text-[#A1A1AA]">
                          <span className="font-semibold text-[#F5F5F0]">
                            Admin Note
                          </span>
                          {reply.pending ? (
                            <span className="inline-flex items-center gap-1.5 font-mono-code text-[#F5D90A]">
                              <Loader2
                                className="h-3 w-3 animate-spin"
                                aria-hidden="true"
                              />
                              Saving...
                            </span>
                          ) : (
                            <span>
                              {new Date(reply.createdAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-[#F5F5F0]">
                          {reply.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-[#71717A]">
                    No internal replies saved yet.
                  </p>
                )}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleReplySubmit} className="mt-6 space-y-3">
                <label
                  htmlFor={replyInputId}
                  className="block text-sm font-medium text-[#F5F5F0]"
                >
                  Add Internal Reply
                </label>
                <textarea
                  id={replyInputId}
                  rows={3}
                  required
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder="Write an internal reply or follow-up note (stored in D1, not emailed)..."
                  className="min-h-[96px] w-full resize-y rounded-[8px] border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-3 text-sm text-[#F5F5F0] placeholder:text-[#71717A] focus:border-[#F5D90A]"
                />
                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={
                      !replyDraft.trim() ||
                      replySubmittingId === selectedMessage.id
                    }
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] bg-[#F5D90A] px-5 py-2.5 font-display text-sm font-bold text-[#0B0B0B] transition-colors hover:bg-[#FFE524] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span>Save Reply</span>
                  </button>
                </div>
              </form>
            </article>
          ) : (
            <div className="flex min-h-[300px] items-center justify-center rounded-[16px] border border-[#242424] bg-[#141414] p-8 text-sm text-[#A1A1AA]">
              Select a message to view details and internal replies.
            </div>
          )}
        </div>
      </div>

      {/* Native Accessible Delete Confirmation Dialog */}
      <dialog
        ref={deleteDialogRef}
        aria-labelledby={deleteDialogTitleId}
        className="m-auto w-[min(92vw,440px)] rounded-[16px] border border-[#2A2A2A] bg-[#141414] p-6 text-[#F5F5F0] backdrop:bg-black/75"
      >
        <h2 id={deleteDialogTitleId} className="text-subhead text-[#F5F5F0]">
          Delete Message?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
          This will permanently delete the message from{" "}
          <strong className="text-[#F5F5F0]">
            {pendingDeleteTarget?.name}
          </strong>{" "}
          and all associated internal replies from D1.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={cancelDelete}
            className="min-h-[44px] rounded-[8px] border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-2 text-sm font-medium text-[#F5F5F0] hover:border-[#F5D90A]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void confirmDelete()}
            className="min-h-[44px] rounded-[8px] bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600"
          >
            Confirm Delete
          </button>
        </div>
      </dialog>
    </section>
  );
}
