import { assertEquals } from "jsr:@std/assert@1";
import {
  isValidIdempotencyKey,
  isValidOrganizationId,
  readQuotaDecision,
} from "./policy.ts";

Deno.test("reads a one-row Supabase RPC result", () => {
  assertEquals(
    readQuotaDecision([{ allowed: false, retry_after_seconds: 87, remaining_requests: 0 }]),
    { allowed: false, retryAfterSeconds: 87, remainingRequests: 0 },
  );
});

Deno.test("normalises a single-row RPC result", () => {
  assertEquals(
    readQuotaDecision({ allowed: true, retry_after_seconds: 0, remaining_requests: 9 }),
    { allowed: true, retryAfterSeconds: 0, remainingRequests: 9 },
  );
});

Deno.test("fails closed for malformed quota results", () => {
  assertEquals(readQuotaDecision(null), null);
  assertEquals(readQuotaDecision({ allowed: "true", retry_after_seconds: 0, remaining_requests: 1 }), null);
  assertEquals(readQuotaDecision([]), null);
});

Deno.test("validates organisation UUIDs", () => {
  assertEquals(isValidOrganizationId("9ff3ac28-aff3-4c56-95ba-09c99ccbd598"), true);
  assertEquals(isValidOrganizationId("not-a-uuid"), false);
  assertEquals(isValidOrganizationId(null), false);
});

Deno.test("bounds idempotency keys", () => {
  assertEquals(isValidIdempotencyKey("request-key-123"), true);
  assertEquals(isValidIdempotencyKey("short"), false);
  assertEquals(isValidIdempotencyKey("x".repeat(161)), false);
});
