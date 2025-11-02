# 30-Day Session Persistence - Implementation & Verification

## ✅ Changes Made

### 1. JWT Token Expiry (`server/src/utils/jwt.ts`)

- Access Token: `15m` (15 minutes)
- Refresh Token: `30d` (30 days)

### 2. Cookie Max Age (`server/src/utils/cookieHelper.ts`)

- Access Token Cookie: `15 * 60 * 1000` ms = 900,000 ms = 15 minutes
- Refresh Token Cookie: `30 * 24 * 60 * 60 * 1000` ms = 2,592,000,000 ms = 30 days

### 3. Cookie Persistence Fix

Added `expires` property alongside `maxAge` to ensure cookies persist across browser sessions:

```typescript
{
  maxAge: 2592000000, // 30 days in milliseconds
  expires: new Date(Date.now() + 2592000000), // Explicit expiration date
  httpOnly: true,
  secure: false, // false in development (HTTP), true in production (HTTPS)
  sameSite: 'lax',
  path: '/'
}
```

### 4. Token Blacklist TTL (`server/src/controllers/authController.ts`)

Updated logout function to blacklist refresh token for 30 days:

- Access Token: 900 seconds (15 minutes)
- Refresh Token: 2,592,000 seconds (30 days)

---

## 🧪 How to Verify the Fix

### Step 1: Clear All Existing Cookies

1. Open Chrome DevTools (`F12`)
2. Go to **Application** tab → **Cookies** → `http://localhost:3000`
3. Delete all cookies (especially `accessToken` and `refreshToken`)

### Step 2: Login Fresh

1. Restart your server: `cd server && npm start`
2. Login to your app
3. Immediately check cookies in DevTools

### Step 3: Verify Cookie Settings

In DevTools → Application → Cookies, you should see:

**`refreshToken` cookie:**

- Value: (JWT token)
- Domain: localhost
- Path: /
- Expires: **30 days from now** (check the actual date)
- HttpOnly: ✅
- Secure: (empty in dev)
- SameSite: Lax

**`accessToken` cookie:**

- Expires: **~15 minutes from now**
- Other settings same as above

### Step 4: Test Persistence

1. **Scenario A: Close tab (keep browser open)**

   - Close the tab
   - Wait 1 hour
   - Open new tab → go to `http://localhost:3000`
   - ✅ Should still be logged in

2. **Scenario B: Close entire browser**

   - Close ALL browser windows completely
   - Wait 1 hour
   - Restart browser → go to `http://localhost:3000`
   - ✅ Should still be logged in

3. **Scenario C: Wait 30+ days**
   - (Can't test in real-time, but you can manually delete cookies to simulate)

### Step 5: Test Auto-Refresh

1. Login and note the `accessToken` expiry (15 min)
2. Wait 20 minutes (or manually delete `accessToken` cookie)
3. Make any API request (e.g., navigate to a protected page)
4. ✅ Should auto-refresh and stay logged in without redirect

---

## 🐛 Debugging Checklist

If you're still getting logged out:

### Check 1: Cookie Settings

```javascript
// In browser console:
document.cookie;
// Should show: "accessToken=...; refreshToken=..."
```

### Check 2: Network Tab

1. Open DevTools → Network tab
2. Make a request
3. Check **Response Headers** for `Set-Cookie`:

```
Set-Cookie: refreshToken=xxx; Max-Age=2592000; Path=/; HttpOnly; SameSite=Lax
```

### Check 3: Server Logs

Look for these logs in your terminal:

```
✅ Token blacklist connected (in-memory mode)
[CookieHelper] Access token cookie set
[CookieHelper] Refresh token cookie set
```

### Check 4: Browser Settings

Some browsers clear cookies on exit if:

- "Clear cookies on exit" is enabled
- Using Incognito/Private mode
- Using a privacy extension that clears cookies

**Fix**: Check Chrome settings → Privacy → Cookies → "Clear cookies and site data when you close all windows" should be **OFF**

---

## 🔍 Common Issues

### Issue: "Still logged out after few hours"

**Cause**: Browser is clearing cookies despite `expires` being set.

**Solution**:

1. Check browser cookie settings (see above)
2. Make sure you're not in Incognito mode
3. Try a different browser to isolate the issue

### Issue: "401 errors even with valid refresh token"

**Cause**: Refresh token is blacklisted or server restarted (Keyv uses in-memory storage).

**Solution**:

- If server restarted, all blacklisted tokens are cleared (expected behavior in dev)
- In production, use Redis/MongoDB adapter for persistent blacklist storage

### Issue: "Cookies not showing in DevTools"

**Cause**: Cookie domain mismatch or path issue.

**Solution**:

1. Make sure client runs on `localhost:3000`
2. Make sure server runs on `localhost:4000`
3. Check CORS and `withCredentials: true` in API calls

---

## 📊 Expected Behavior Summary

| Time    | Access Token | Refresh Token | What Happens          |
| ------- | ------------ | ------------- | --------------------- |
| Login   | ✅ Valid     | ✅ Valid      | User logged in        |
| 15 min  | ❌ Expired   | ✅ Valid      | Auto-refresh (silent) |
| 1 hour  | ❌ Expired   | ✅ Valid      | Auto-refresh (silent) |
| 1 day   | ❌ Expired   | ✅ Valid      | Auto-refresh (silent) |
| 7 days  | ❌ Expired   | ✅ Valid      | Auto-refresh (silent) |
| 29 days | ❌ Expired   | ✅ Valid      | Auto-refresh (silent) |
| 31 days | ❌ Expired   | ❌ Expired    | **Redirect to login** |

---

## ✅ Tests Passing

All 14 cookie persistence tests pass:

- ✅ Access token expires in 15 minutes
- ✅ Refresh token expires in 30 days
- ✅ Cookies include both `maxAge` and `expires`
- ✅ Cookies are persistent (not session cookies)
- ✅ httpOnly enabled for security
- ✅ Works in development (HTTP)
- ✅ Works in production (HTTPS)

---

## 🚀 Next Steps

1. **Restart your server** with the new changes:

   ```bash
   cd server
   npm start
   ```

2. **Clear all cookies** in your browser

3. **Login again** and verify cookies in DevTools

4. **Test** by closing browser and coming back after 1+ hours

5. **Report back** if you still face issues (with screenshots of DevTools → Cookies)
