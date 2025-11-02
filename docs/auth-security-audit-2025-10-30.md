# Auth Security Audit – HubImmo (2025-10-30)

Rating: 8.5/10

Summary: The authentication stack is robust and thoughtfully engineered. It uses httpOnly cookies with SameSite=strict, strong password policies (zxcvbn + zod), account lockout + rate limiting, comprehensive input validation/sanitization, CSRF on state-changing routes, and structured security logging. The main gaps are refresh-token rotation/reuse detection, returning tokens in JSON responses (despite cookies), plaintext storage of verification/reset codes, and a minor JWT payload mismatch in two places.

## What’s solid

- Cookie-based auth
  - httpOnly, Secure (in prod), SameSite=strict set via `cookieHelper.ts`.
  - CORS restricted to known origins with `credentials: true`.
- CSRF defense
  - `csurf` cookie strategy on state-changing APIs; dedicated `/api/csrf-token` endpoint.
- Transport and headers
  - Helmet with CSP, HSTS, X-Frame-Options=deny, noSniff, referrer policy, extra hardening headers.
- Password policy and storage
  - zod + zxcvbn enforcement; bcrypt with cost 12; password history (last 5) enforced; timing-safe comparisons.
- Brute-force controls
  - Rate limiting (Redis-backed when available) for auth endpoints; account lockout after 5 failures for 30 minutes with user notification.
- Input hygiene
  - Central sanitizers for strings, email, phone, and Mongo query safety; zod validation for all auth routes.
- Logging and auditability
  - Structured security logs (login success/fail, lockouts, resets) with TTL (90 days), including IP and User-Agent.

## Gaps and risks (ordered by impact)

1. No refresh-token rotation or reuse detection
   - `/api/auth/refresh` issues a new access token but doesn’t rotate the refresh token or detect reuse. There’s no server-side allowlist/denylist per refresh token `jti`.
2. Tokens are returned in JSON responses
   - `login`, `verifyEmail`, `resetPassword` include `token` and `refreshToken` in the body, even though cookies are already set. This increases exposure surface (e.g., accidental logging, client-side XSS exfiltration).
3. Verification/reset codes stored in plaintext
   - Codes are compared timing-safely but stored unhashed in DB. If DB is leaked, codes can be used until expiry.
4. Minor bug: JWT payload mismatch
   - In `logout` and rate limiter `keyGenerator`, code expects `{ id }` but tokens carry `{ userId }`. This can break per-user rate keys and skip security event linkage on logout.
5. No 2FA/MFA
   - Optional but strongly recommended for sensitive flows (login, password reset confirmation, payout/billing actions).
6. Session/device management
   - No per-device session list, last-used times, or server-side session invalidation beyond Redis blacklist on logout. Prior refresh tokens remain valid.
7. CSRF on refresh endpoint
   - Not applied (acceptable due to SameSite=strict) but adding CSRF or rotating via same-origin fetch can further reduce risk if SameSite policy changes.
8. Cookie clearing options
   - `clearCookie` uses only path; mirroring the same attributes (`domain`, `sameSite`, `secure`) can avoid rare sticky-cookie cases in some proxies/browsers.

## Prioritized recommendations

1. Implement refresh token rotation and reuse detection
   - Add `jti` and `exp` to refresh tokens; store allowlisted refresh sessions in DB/Redis keyed by userId+jti; rotate on each refresh; revoke old; detect reuse and revoke all sessions for that user.
2. Stop returning tokens in JSON bodies
   - Remove `token` and `refreshToken` from success payloads; rely exclusively on cookies. Update client to ignore token fields if any remain.
3. Hash verification/reset codes at rest
   - Store SHA-256 of codes (e.g., `hashCode()`) and compare hashes; keep strict TTL and single-use semantics; purge on success.
4. Fix JWT payload reads
   - Use `{ userId }` consistently in `logout` and rate limiter `keyGenerator`.
5. Optional MFA
   - Add TOTP (RFC 6238) with backup codes. Gate high-risk paths and new-device logins.
6. Add sessions/devices view and revocation
   - Track deviceId, IP, UA, createdAt/lastUsed; allow users to revoke individually; expire long-idle sessions server-side.
7. Consider CSRF on `/auth/refresh`
   - Either protect with CSRF token or rotate only via same-origin XHR using a double-submit token.
8. Harden cookie clearing
   - Mirror cookie attributes when clearing; consider setting explicit `domain` if you serve from multiple subdomains.

## Quick checklist

- Cookies: httpOnly + Secure (prod) + SameSite=strict – PASS
- CORS scoped + credentials – PASS
- CSRF on state-changing routes – PASS
- Access (15m) + Refresh (7d) – PASS
- Refresh rotation – FAIL (add rotation + reuse detection)
- Token exposure in JSON – FAIL (remove)
- Code storage hashing – FAIL (hash)
- Lockout + rate limit – PASS
- zod + sanitization – PASS
- Security logging with TTL – PASS

## Verdict

Excellent foundation and modern defenses already in place. Addressing refresh-token lifecycle, eliminating token echoes in responses, hashing verification/reset codes, and fixing the minor JWT payload mismatch will elevate this to enterprise-grade.

Overall rating: 8.5/10
