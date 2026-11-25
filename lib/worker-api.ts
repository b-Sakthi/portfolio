import type {
  AnalyticsSummary,
  RecordVisitPayload,
} from "@/lib/analytics-types";
import type {
  AdminReply,
  ApiResponse,
  ContactMessage,
  ContactSubmitPayload,
  ContactSubmitResponse,
  MessageStatus,
} from "@/lib/contact-types";
import { siteConfig } from "@/lib/site-config";

function getBaseUrl(overrideBaseUrl?: string): string {
  const base = (overrideBaseUrl ?? siteConfig.workerUrl).replace(/\/+$/, "");
  if (!base) {
    throw new Error(
      "Cloudflare Worker URL is not configured (set NEXT_PUBLIC_WORKER_URL)."
    );
  }
  return base;
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const json = (await res.json()) as { error?: string };
    if (json && typeof json.error === "string" && json.error.trim()) {
      return json.error;
    }
  } catch {
    // Ignore non-JSON error body
  }
  return `${fallback} (HTTP ${res.status})`;
}

export async function submitContactForm(
  payload: ContactSubmitPayload,
  baseUrl?: string
): Promise<ContactSubmitResponse> {
  const base = getBaseUrl(baseUrl);
  const res = await fetch(`${base}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: ContactSubmitResponse | null = null;
  try {
    data = (await res.json()) as ContactSubmitResponse;
  } catch {
    data = null;
  }

  if (!res.ok || !data?.ok) {
    throw new Error(
      data?.error || `Failed to submit message (HTTP ${res.status}).`
    );
  }

  return data;
}

export async function verifyAdminToken(
  token: string,
  baseUrl?: string
): Promise<boolean> {
  const base = getBaseUrl(baseUrl);
  const res = await fetch(`${base}/api/admin/auth`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (res.status === 401) {
    return false;
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Authentication failed"));
  }
  const json = (await res.json()) as { ok?: boolean };
  return Boolean(json.ok);
}

export async function logoutAdmin(baseUrl?: string): Promise<void> {
  const base = getBaseUrl(baseUrl);
  await fetch(`${base}/api/admin/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function fetchAdminMessages(
  baseUrl?: string
): Promise<ContactMessage[]> {
  const base = getBaseUrl(baseUrl);
  const res = await fetch(`${base}/api/admin/messages`, {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to load inbox"));
  }

  const json = (await res.json()) as ApiResponse<ContactMessage[]>;
  if (!json.ok || !Array.isArray(json.data)) {
    throw new Error(json.error || "Invalid inbox response.");
  }
  return json.data;
}

export async function fetchAdminMessageDetail(
  messageId: string,
  baseUrl?: string
): Promise<ContactMessage> {
  const base = getBaseUrl(baseUrl);
  const res = await fetch(
    `${base}/api/admin/messages/${encodeURIComponent(messageId)}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to load message details"));
  }

  const json = (await res.json()) as ApiResponse<ContactMessage>;
  if (!json.ok || !json.data) {
    throw new Error(json.error || "Invalid message detail response.");
  }
  return json.data;
}

export async function createAdminReply(
  messageId: string,
  body: string,
  clientReplyId: string,
  baseUrl?: string
): Promise<{ reply: AdminReply; status: MessageStatus }> {
  const base = getBaseUrl(baseUrl);
  const res = await fetch(
    `${base}/api/admin/messages/${encodeURIComponent(messageId)}/replies`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body, clientReplyId }),
    }
  );

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to save reply"));
  }

  const json = (await res.json()) as ApiResponse<{
    reply: AdminReply;
    status: MessageStatus;
  }>;
  if (!json.ok || !json.data) {
    throw new Error(json.error || "Invalid reply response.");
  }
  return json.data;
}

export async function updateMessageStatus(
  messageId: string,
  status: MessageStatus,
  baseUrl?: string
): Promise<{ id: string; status: MessageStatus; updatedAt: string }> {
  const base = getBaseUrl(baseUrl);
  const res = await fetch(
    `${base}/api/admin/messages/${encodeURIComponent(messageId)}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to update status"));
  }

  const json = (await res.json()) as ApiResponse<{
    id: string;
    status: MessageStatus;
    updatedAt: string;
  }>;
  if (!json.ok || !json.data) {
    throw new Error(json.error || "Invalid status response.");
  }
  return json.data;
}

export async function deleteAdminMessage(
  messageId: string,
  baseUrl?: string
): Promise<void> {
  const base = getBaseUrl(baseUrl);
  const res = await fetch(
    `${base}/api/admin/messages/${encodeURIComponent(messageId)}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to delete message"));
  }
}

export async function recordPageVisit(
  payload: RecordVisitPayload,
  baseUrl?: string
): Promise<void> {
  const base = getBaseUrl(baseUrl);
  await fetch(`${base}/api/analytics/visit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  });
}

export async function fetchAnalyticsSummary(
  days = 30,
  baseUrl?: string
): Promise<AnalyticsSummary> {
  const base = getBaseUrl(baseUrl);
  const res = await fetch(
    `${base}/api/admin/analytics/summary?days=${encodeURIComponent(String(days))}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to load analytics"));
  }

  const json = (await res.json()) as ApiResponse<AnalyticsSummary>;
  if (!json.ok || !json.data) {
    throw new Error(json.error || "Invalid analytics response.");
  }
  return json.data;
}
