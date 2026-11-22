export type QuotaDecision = {
  allowed: boolean;
  retryAfterSeconds: number;
  remainingRequests: number;
};

export function readQuotaDecision(value: unknown): QuotaDecision | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== "object") return null;

  const candidate = row as Record<string, unknown>;
  if (typeof candidate.allowed !== "boolean") return null;
  if (candidate.retry_after_seconds == null || candidate.remaining_requests == null) return null;

  const retry = Number(candidate.retry_after_seconds);
  const remaining = Number(candidate.remaining_requests);
  if (!Number.isFinite(retry) || !Number.isFinite(remaining)) return null;

  return {
    allowed: candidate.allowed,
    retryAfterSeconds: Math.max(0, Math.ceil(retry)),
    remainingRequests: Math.max(0, Math.floor(remaining)),
  };
}

export function isValidOrganizationId(value: unknown): value is string {
  return typeof value === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isValidIdempotencyKey(value: unknown): value is string {
  return typeof value === "string" && value.length >= 12 && value.length <= 160;
}
