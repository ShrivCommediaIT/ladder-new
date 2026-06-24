# Comprehensive Code Review Report — Next.js Project

**Project:** `C:\Users\SCMS-PC-06\ladder-new`  
**Review Date:** 2026-06-23  
**Reviewer:** Senior Code Reviewer (AI Assistant)  
**Framework:** Next.js 15.5.7 + React 19.1.0 + Redux Toolkit + Tailwind CSS v4

---

## Executive Summary

This is a large, feature-rich Next.js application for a sports leaderboard / talent-board platform called "Sports Solutions Pro (SSP)". While the UI is polished and feature-complete, the codebase suffers from **critical security vulnerabilities**, **severe architectural anti-patterns**, **performance bottlenecks**, and **significant code-quality issues**. The most urgent concerns are:

1. **Hardcoded API secrets** and **client-side auth tokens** stored in `sessionStorage`.
2. **Entire application forced to client-side** rendering via `"use client"` in `layout.js`.
3. **No middleware-based auth** — route guards are implemented via fragile `useEffect` hooks.
4. **XSS vulnerabilities** via `dangerouslySetInnerHTML` without sanitization.
5. **SSRF vulnerability** in the `/api/download` route.
6. **No TypeScript** — a project of this size and complexity should be typed.

---

## 1. Security Issues (CRITICAL)

### 1.1 Hardcoded API Secret (Fallback APPKEY)
**File:** `constants/api.js` (lines 7–9)
**Issue:**
```js
export const APPKEY =
  process.env.NEXT_PUBLIC_APPKEY ||
  "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";
```
- **Why it's a problem:** The `APPKEY` is a hardcoded fallback API secret. If the environment variable is missing during build or runtime, this secret is exposed in the client bundle. It is sent with every request.
- **Suggested Fix:** Remove the fallback entirely. Throw an error at build time if the env var is missing:
  ```js
  const appKey = process.env.NEXT_PUBLIC_APPKEY;
  if (!appKey) throw new Error("NEXT_PUBLIC_APPKEY is required");
  export const APPKEY = appKey;
  ```

---

### 1.2 Client-Side Session Storage for Auth Tokens
**Files:** Too many to list — occurs in `layout.js`, `Navbar.jsx`, `Profile.jsx`, `useAuthGuard.js`, `axiosInstance.js`, `redux/slices/userSlice.js`, `redux/slices/loginClub.js`, and dozens of components.
**Issue:**
- `sessionStorage` is used to store `userData`, `subAdmin`, `adminDetails`, `token`, and other sensitive auth data.
- **Why it's a problem:** `sessionStorage` is accessible to any JavaScript running on the page. A single XSS vulnerability would allow an attacker to steal tokens, impersonate users, and perform admin actions. This is not a secure storage mechanism for authentication credentials.
- **Suggested Fix:** Move to **HTTP-only, Secure, SameSite cookies** set by the server. Use Next.js middleware to validate the session cookie and attach auth headers server-side. If client-side state is needed, store only a non-sensitive user identifier.

---

### 1.3 dangerouslySetInnerHTML Without Sanitization
**Files:**
- `components/pages/players/LadderRulesCard.jsx` (line 196)
- `components/pages/users/LadderRuleCardUser.jsx` (line 96)
**Issue:**
```jsx
<div dangerouslySetInnerHTML={{ __html: rule.rules || "No rules available." }} />
```
- **Why it's a problem:** If `rule.rules` contains malicious HTML/JS from the API (e.g., `<script>alert('xss')</script>`), it will execute in the user's browser. This is a direct XSS vulnerability.
- **Suggested Fix:** Sanitize the HTML string before rendering. Use `DOMPurify` (on the client) or a server-side sanitization library. Alternatively, render the content as plain text or use a Markdown renderer with sanitized output.

---

### 1.4 SSRF in API Download Route
**File:** `app/api/download/route.js`
**Issue:**
```js
const fileUrl = searchParams.get("url");
const res = await fetch(fileUrl);
```
- **Why it's a problem:** There is **no URL validation or whitelist**. An attacker can pass any URL (e.g., internal metadata endpoints, cloud provider APIs, localhost services) and the server will fetch it. This is a Server-Side Request Forgery (SSRF) vulnerability.
- **Suggested Fix:** Validate the URL against a strict whitelist of allowed domains/paths. Parse the URL, check the hostname, and reject anything not explicitly allowed. Do not follow redirects blindly.

---

### 1.5 Insecure Encoding (Base64) Used for URL Obfuscation
**Files:**
- `app/[action]/[encodedId]/page.js` (line 36)
- `components/shared/UserDetails.jsx` (line 83)
- `components/shared/LadderLink.jsx` (line 20)
- `app/register-user/[encodedId]/page.js` (line 22)
- `components/demo/DemoRegister.jsx` (lines 85–86)
**Issue:**
- `btoa()` and `atob()` are used to encode/decode ladder IDs and user IDs in URLs.
- **Why it's a problem:** Base64 is not encryption. Anyone can decode these values. If the IDs are sequential integers, this provides zero security and a false sense of protection.
- **Suggested Fix:** Use proper UUIDs or nanoids for public-facing IDs. If encoding is necessary, use a server-side encryption mechanism (e.g., AES-GCM with a server-side key) and never rely on client-side obfuscation.

---

### 1.6 Missing Content Security Policy (CSP)
**File:** `next.config.mjs`
**Issue:** The Next.js config only contains an `images.domains` array. There are no security headers, no CSP, no HSTS, no X-Frame-Options.
- **Suggested Fix:** Add a comprehensive CSP and security headers via `next.config.mjs` or Next.js middleware. Example:
  ```js
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' ..." },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ],
    }];
  }
  ```

---

### 1.7 iframe Without Sandbox Attribute
**File:** `components/shared/PerformanceDatabase.jsx` (lines 1068–1077)
**Issue:**
```jsx
<iframe
  src={activeVideo}
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```
- **Why it's a problem:** If the video URL is attacker-controlled, the iframe can execute scripts, navigate the parent, or perform other malicious actions without restriction.
- **Suggested Fix:** Add `sandbox="allow-scripts allow-same-origin allow-presentation"` and validate that the URL is from a trusted domain (YouTube, Vimeo, etc.) before rendering.

---

### 1.8 Dynamic Script Injection (PayPal)
**File:** `app/submit-performance/page.js` (lines 224–235)
**Issue:** The code dynamically creates and injects `<script>` tags via `document.createElement` for PayPal SDK loading, and uses `document.getElementById` to manipulate DOM nodes directly.
- **Why it's a problem:** This bypasses React's Virtual DOM and can lead to script injection if the `clientId` or `hostedButtonId` env vars are ever compromised or contain malicious values. It also creates a messy global state (`window.paypal`).
- **Suggested Fix:** Use the official `@paypal/react-paypal-js` package (already in `package.json`!) instead of manual script injection. It handles loading, cleanup, and React integration properly.

---

## 2. React / Next.js Anti-Patterns (HIGH)

### 2.1 "use client" in Root Layout
**File:** `app/layout.js` (line 1)
**Issue:** The root layout is marked as a Client Component.
- **Why it's a problem:** This forces the **entire application** to render on the client. Next.js App Router's main benefit is Server Components, which reduce JS bundle size and improve initial page load. With `"use client"` at the root, every page, every component, and every library is shipped to the browser.
- **Suggested Fix:** Remove `"use client"` from `layout.js`. Keep the layout as a Server Component. Move the `Provider`, `PersistGate`, `ThemeProvider`, and `ToastContainer` into a separate client wrapper component (e.g., `ClientProviders`) that is imported into the layout. Only mark the interactive parts as client components.

---

### 2.2 suppressHydrationWarning Misuse
**File:** `app/layout.js` (lines 40–41)
**Issue:**
```jsx
<html lang="en" suppressHydrationWarning>
  <body suppressHydrationWarning>
```
- **Why it's a problem:** `suppressHydrationWarning` is a debugging tool, not a fix. It masks the underlying hydration mismatches. The root cause is likely the theme provider or sessionStorage access during render. Silencing warnings makes it impossible to detect real hydration bugs.
- **Suggested Fix:** Fix the root cause. Do not access `sessionStorage` during the initial render (use `useEffect`). Ensure the server and client render the same initial HTML. Use `mounted` guards only on specific interactive elements, not the entire document.

---

### 2.3 Missing Next.js Middleware for Auth
**Issue:** There is no `middleware.js` or `middleware.ts` in the project.
- **Why it's a problem:** Authentication guards are implemented inside components (`useAuthGuard.js`, `DynamicPage`, `AdminPageRouter`) using `useEffect` and `sessionStorage`. This is:
  - Fragile (can be bypassed by simply disabling JavaScript or modifying the client)
  - Causes layout shift / flash of unauthenticated content
  - Duplicated across many pages
- **Suggested Fix:** Implement a `middleware.js` at the project root that checks for an auth cookie/session on the server for protected routes. Redirect unauthenticated users before the page ever renders.

---

### 2.4 No Suspense Boundaries
**Issue:** The app does not use `<Suspense>` anywhere for async data fetching, dynamic imports, or streaming.
- **Why it's a problem:** Without `Suspense`, the entire page blocks until all data is fetched. Users see a blank or partially loaded page. This also hurts Core Web Vitals (LCP, INP).
- **Suggested Fix:** Wrap async components and data fetching in `<Suspense fallback={<Loading />}>` boundaries. Use `loading.js` files in route segments where appropriate.

---

### 2.5 Empty AppInit Component
**File:** `components/AppInit.jsx`
**Issue:**
```jsx
const AppInit = () => {
  return (<div></div>);
};
```
- **Why it's a problem:** This component is included in the root layout inside `PersistGate`. It renders an empty `div` on every page load. It serves no purpose and adds unnecessary DOM noise.
- **Suggested Fix:** Remove `AppInit` from the layout, or repurpose it to perform actual initialization (e.g., analytics setup, service worker registration) inside a `useEffect`.

---

### 2.6 Unused Wrapper Components
**Files:**
- `app/login-page/page.js`
- `app/register-page/page.js`
- `app/user-list/page.js`
**Issue:** These pages are thin wrappers that do nothing except render another component. `user-list/page.js` literally just renders the text `Hello` and ignores the imported `UserList` component.
- **Suggested Fix:** Remove unnecessary wrapper pages. Export the actual component directly from the page file, or use the component as the default export.

---

### 2.7 Deprecated `<style jsx>` in App Router
**File:** `components/shared/OnboardingFlow.jsx` (lines 255–263)
**Issue:** Uses `styled-jsx` (`<style jsx>{`...`}</style>`) which is not officially supported in the App Router.
- **Suggested Fix:** Move the styles to the global CSS file (`globals.css`) or use a Tailwind utility class approach. For scoped styles, use CSS Modules or the `styled-components` / `emotion` approach if needed.

---

### 2.8 `useEffect` for Auth Checks Instead of Middleware / Server Logic
**Files:** `hooks/useAuthGuard.js`, `app/[action]/[encodedId]/page.js`, `app/admin-page/page.js`
**Issue:** Auth checks happen on the client after the component mounts. This causes:
  - A flash of unauthenticated content
  - Potential for users to bypass guards by manipulating client state
  - SEO issues (search engines may index "404" redirects or partially loaded pages)
- **Suggested Fix:** Use Next.js `middleware.js` for route protection. For pages that need auth data, fetch it server-side where possible.

---

### 2.9 `router.replace("/404")` Instead of Proper 404 or Login Redirect
**Files:** `hooks/useAuthGuard.js` (line 28), `app/[action]/[encodedId]/page.js` (lines 29, 38, 41)
**Issue:** Unauthenticated users are redirected to `/404`, not a login page.
- **Why it's a problem:** This is confusing UX and bad for SEO. A 404 implies the page doesn't exist, not that the user is unauthorized. It also doesn't preserve the original URL for post-login redirect.
- **Suggested Fix:** Redirect to `/login-page` (or `/login-user`) with a `?redirect=` query parameter so users can return after authentication.

---

### 2.10 `window.open` and `window.location` Used Instead of Next.js Router
**Files:** `components/shared/Navbar.jsx`, `components/shared/UserDetails.jsx`, `components/pages/admin/ResetPassword.jsx`, `components/pages/payment/PlanHeading.jsx`, `app/ladder-view/page.js`, etc.
**Issue:** `window.open("/q-a", "_blank")`, `window.location.href = "..."`, `window.location.reload()` are used throughout.
- **Why it's a problem:** These bypass Next.js's client-side routing, causing full page reloads and losing React state. They also break prefetching and transitions.
- **Suggested Fix:** Use `next/link` with `target="_blank"` for external/new-tab navigation. Use `router.push()` / `router.replace()` from `next/navigation` for internal navigation. Never use `window.location.reload()` in a React app.

---

## 3. Performance Issues (HIGH)

### 3.1 Entire Redux Store Persisted to SessionStorage
**File:** `redux/store.js` (lines 38–70)
**Issue:** The `whitelist` includes almost every reducer: `user`, `clubAuth`, `player`, `playerMove`, `ladder`, `activity`, `editdetail`, `userByRank`, `profileImage`, `profile`, `players`, `playerStatus`, `import`, `ladderlist`, `playersLadder`, `resetLeaderboard`, `gradebar`, `playerResult`, `minileague`, `minileaguePlayerMoving`, `skillLeaderboard`, `positiveLeaderBoard`, `negativeLeaderBoard`, `club`, `roster`, `rosterLeaderboard`, `progressFlow`, `subscription`.
- **Why it's a problem:** This causes a massive amount of data to be serialized/deserialized on every Redux state change. It blocks the main thread, increases memory usage, and can lead to quota exceeded errors in `sessionStorage` (typically 5–10 MB). It also means the entire store is lost when the tab is closed, which may not be the intended behavior.
- **Suggested Fix:** Persist only the minimal auth state (a token reference, not the full user object). Cache API data using React Query / SWR or a proper caching layer, not Redux persist.

---

### 3.2 `serializableCheck: false` in Redux Middleware
**File:** `redux/store.js` (line 113)
**Issue:**
```js
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: false,
  }),
```
- **Why it's a problem:** This disables Redux Toolkit's serialization warnings. It hides bugs where non-serializable data (functions, Dates, Promises, DOM nodes) is stored in Redux, which can cause unpredictable behavior, especially with persistence.
- **Suggested Fix:** Remove `serializableCheck: false` and fix the underlying serialization issues. Only store plain serializable objects in Redux.

---

### 3.3 No Code Splitting / Lazy Loading
**Issue:** There is no evidence of `dynamic()` imports, `React.lazy()`, or route-based code splitting. The entire application bundle is likely massive given the number of dependencies (Radix UI, Framer Motion, GSAP, TipTap, etc.).
- **Suggested Fix:** Use `next/dynamic` for heavy components (e.g., `PerformanceDatabase`, `OnboardingFlow`, `PlanHeading`, charts, PDF generators). Split admin pages, player pages, and payment flows into separate chunks.

---

### 3.4 API Polling Every Second
**File:** `components/pages/players/ActivityList.jsx` (line 36, from Grep results)
**Issue:** `setInterval(fetchActivity, 1000)` — hits the API every second.
- **Why it's a problem:** This creates unnecessary server load and drains client battery/network. If the user leaves the tab open, it continues indefinitely.
- **Suggested Fix:** Use a WebSocket or Server-Sent Events (SSE) for real-time updates. If polling is necessary, use a longer interval (e.g., 30s), and pause it when the tab is hidden (`document.visibilityState`).

---

### 3.5 Console Logs in Production
**Issue:** Extensive `console.log`, `console.warn`, and `console.error` calls exist in dozens of files. These are shipped to production and hurt performance.
- **Suggested Fix:** Use a proper logging library (e.g., `loglevel`, `pino`) that can be disabled in production. Add a Babel/ESLint rule to strip `console` statements during the build.

---

### 3.6 Memory Leak: `URL.createObjectURL` Not Revoked
**File:** `components/shared/Navbar.jsx` (lines 139–140)
**Issue:**
```js
const previewUrl = URL.createObjectURL(file);
setSelectedLogoPreview(previewUrl);
```
There is no corresponding `URL.revokeObjectURL(previewUrl)` call when the component unmounts or when a new file is selected.
- **Why it's a problem:** Each call creates a new blob URL that persists in memory until revoked. Repeated logo uploads will leak memory.
- **Suggested Fix:** Revoke the object URL in a cleanup function:
  ```js
  useEffect(() => {
    return () => {
      if (selectedLogoPreview) URL.revokeObjectURL(selectedLogoPreview);
    };
  }, [selectedLogoPreview]);
  ```

---

### 3.7 Inefficient Counter API Call
**File:** `components/pages/payment/PlanHeading.jsx` (line 86)
**Issue:** `fetch("https://api.counterapi.dev/v1/ssp-leaderboard/visits/up")` is called on every page load to increment a view counter.
- **Why it's a problem:** This is a blocking network call on the critical path. It delays rendering and can fail, causing the fallback logic to run.
- **Suggested Fix:** Use `navigator.sendBeacon()` or a non-blocking `fetch` with low priority. Better yet, track analytics server-side or via a background worker.

---

## 4. State Management Issues (HIGH)

### 4.1 Auth State Duplicated Between Redux and sessionStorage
**Issue:** The auth token and user data are stored in both Redux (via `redux-persist`) and `sessionStorage`. They are also manually synchronized in `loginClub.js`, `userSlice.js`, and `Navbar.jsx`.
- **Why it's a problem:** This creates multiple sources of truth. If they get out of sync (e.g., one is cleared but the other isn't), the app enters an inconsistent state. It also makes logout logic complex and error-prone.
- **Suggested Fix:** Use **one** auth storage mechanism. Prefer HTTP-only cookies for the token, and keep only UI-related state in Redux. If you must use Redux for auth, do not duplicate it in `sessionStorage`.

---

### 4.2 User Data Merged from 4 Different SessionStorage Keys
**Files:** `components/shared/Navbar.jsx` (lines 339–361), `app/profile/page.js` (lines 95–115), `components/shared/UserDetails.jsx` (lines 50–75), `app/terms-and-conditions/page.js` (lines 34–44), etc.
**Issue:** The same complex merging logic is duplicated across many components:
```js
const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails"));
const subAdmin = JSON.parse(sessionStorage.getItem("subAdmin"));
const admin = JSON.parse(sessionStorage.getItem("userData"));
const normalUser = JSON.parse(sessionStorage.getItem("user"));
// ... merge logic
```
- **Why it's a problem:** Code duplication violates DRY. If the user data structure changes, every component needs to be updated. It's also error-prone.
- **Suggested Fix:** Create a single `useUser()` hook that centralizes user retrieval and merging. Or better, eliminate the need for merging by standardizing the auth data structure server-side.

---

### 4.3 `pendingRequests` Set in `leaderboardSlice` Is Never Cleared on Unmount
**File:** `redux/slices/leaderboardSlice.js` (lines 42–81)
**Issue:** A module-level `Set` called `pendingRequests` is used for request deduplication. If a request is aborted or fails, the key is deleted in the `finally` block, but if the component unmounts during the request, the `finally` block may not run, leaving the key in the set forever.
- **Why it's a problem:** Once a request key is stuck in the set, all future identical requests are silently aborted (`condition` returns `false`).
- **Suggested Fix:** Use Redux Toolkit's built-in `createAsyncThunk` with RTK Query, which handles deduplication, caching, and cleanup automatically. If keeping manual logic, use `AbortController` and ensure cleanup in `useEffect`.

---

### 4.4 `loginUser` Thunk Has a Bizarre Retry Mechanism
**File:** `redux/slices/userSlice.js` (lines 29–60)
**Issue:**
```js
try {
  try {
    const data = await postFormData(API_ENDPOINTS.LOGIN, formData);
    // ...
  } catch (firstErr) {
    // retry once
    const data = await postFormData(API_ENDPOINTS.LOGIN, formData);
    // ...
  }
} catch (err) {
  // ...
}
```
- **Why it's a problem:** This blindly retries on **any** error (including 400 Bad Request, 403 Forbidden, 500 Server Error). It wastes bandwidth and can trigger rate limits. The retry logic is also deeply nested and hard to read.
- **Suggested Fix:** Use a proper retry library (e.g., `axios-retry`) or implement exponential backoff with specific retryable error codes (e.g., 408, 429, 502, 503, 504). Do not retry 4xx errors.

---

## 5. API / Network Issues (MEDIUM)

### 5.1 Missing Response Type Validation
**Issue:** API responses are used directly without any runtime validation. For example, in `services/apiService.js`, `res.data` is returned and consumed everywhere assuming a specific shape (`status`, `data`, `message`, etc.).
- **Why it's a problem:** If the API changes its response shape, the app will crash or behave unpredictably. TypeScript alone won't catch this at runtime.
- **Suggested Fix:** Use a schema validation library (Zod, Yup, or io-ts) to validate API responses at runtime. Define response schemas for each endpoint.

---

### 5.2 Hardcoded API Endpoints in Components
**File:** `components/shared/Navbar.jsx` (lines 157, 304)
**Issue:**
```js
await postFormData("/user/updateladderlogo", formData);
await postWithParams("/user/updateladdername", { ... });
```
- **Why it's a problem:** These bypass the centralized `API_ENDPOINTS` constant. If the base URL or path changes, these will break.
- **Suggested Fix:** Always use `API_ENDPOINTS` from `constants/api.js`.

---

### 5.3 No API Request Cancellation
**Issue:** Most `axios` requests are fire-and-forget. If a user navigates away while a request is in flight, the response may still be processed and attempt to update unmounted component state.
- **Suggested Fix:** Use `AbortController` (or axios's `CancelToken` / `signal`) and pass the signal to requests. Cancel pending requests in `useEffect` cleanup functions.

---

## 6. TypeScript Absence (HIGH)

### 6.1 Entire Project is JavaScript
**Issue:** The project is 100% JavaScript (`.js` / `.jsx`). There are no `.ts` or `.tsx` files. `jsconfig.json` only sets up path aliases.
- **Why it's a problem:** A project of this size (40+ Redux slices, 100+ components, complex API layer) desperately needs type safety. Without it, refactoring is dangerous, API contract changes are invisible, and IDE autocomplete is limited. The `package.json` includes many typed libraries (`zod`, `react-hook-form`, `@hookform/resolvers`) but they're not used to their full potential without TS.
- **Suggested Fix:** Migrate to TypeScript incrementally. Start with `next.config.mjs`, `constants/api.js`, `services/apiService.js`, and the Redux slices. Use `// @ts-check` and JSDoc types as an intermediate step.

---

## 7. Accessibility Issues (MEDIUM)

### 7.1 `img` Tags Used Instead of Next.js `Image`
**Files:**
- `components/shared/PerformanceDatabase.jsx` (lines 979–988) — flag images
- `components/pages/payment/PlanHeading.jsx` (lines 690, 713) — marketing images
- `components/shared/Navbar.jsx` (lines 565–568) — user avatar
- `app/profile/page.js` (lines 428–431) — profile avatar
**Issue:** Standard `<img>` tags are used instead of `next/image`. These miss out on Next.js's built-in optimization, lazy loading, and blur-up placeholders.
- **Suggested Fix:** Replace all `<img>` tags with `next/image`'s `<Image>` component. Ensure `width` and `height` are provided to prevent layout shift.

---

### 7.2 Empty or Missing `alt` Attributes
**File:** `components/shared/PerformanceDatabase.jsx` (line 1234)
**Issue:** `<img src="..." alt="" width={16} height={12} />` — the flag image has an empty `alt`.
- **Suggested Fix:** Provide meaningful alt text (e.g., `{item.country} flag`) or use `aria-hidden="true"` if decorative.

---

### 7.3 Dialogs Missing `aria-describedby`
**Issue:** Many custom dialogs (`Dialog`, `DialogContent`) have titles but no descriptions linked via `aria-describedby`.
- **Suggested Fix:** Add `DialogDescription` components from Radix UI and ensure they're linked to the dialog's `aria-describedby`.

---

### 7.4 Form Inputs Missing Proper Label Association
**Issue:** Some forms use `placeholder` text instead of visible labels, or labels are not properly associated with inputs via `htmlFor`.
- **Suggested Fix:** Ensure every input has a corresponding `<label htmlFor="id">`. Use the `Label` component from `@radix-ui/react-label` consistently.

---

## 8. Build / Deployment Issues (MEDIUM)

### 8.1 Deprecated `images.domains` in `next.config.mjs`
**File:** `next.config.mjs` (lines 3–5)
**Issue:**
```js
images: {
  domains: ['ne-games.com'],
},
```
- **Why it's a problem:** `domains` is deprecated in favor of `remotePatterns` in Next.js 15, which allows more granular control over protocols and ports.
- **Suggested Fix:**
  ```js
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ne-games.com' },
      { protocol: 'https', hostname: 'flagcdn.com' },
    ],
  },
  ```

---

### 8.2 No Environment Variable Validation
**Issue:** `process.env.NEXT_PUBLIC_*` variables are used directly without validation. If any are missing, the app may fail silently or use dangerous fallbacks (like the hardcoded APPKEY).
- **Suggested Fix:** Use `zod` or `envalid` to validate all environment variables at build time and throw descriptive errors if any are missing.

---

### 8.3 Tailwind CSS v4 with Experimental `@theme inline`
**File:** `globals.css` (lines 367–448)
**Issue:** The project uses Tailwind CSS v4 (`@tailwindcss/postcss`) with `@theme inline` and `@custom-variant dark` syntax. This is bleeding-edge and may have compatibility issues with some plugins or IDE extensions.
- **Suggested Fix:** Ensure all team members are aware of the v4 syntax differences. Pin exact versions to avoid breaking changes. Consider using the stable Tailwind v3 configuration if v4 is not strictly necessary.

---

### 8.4 Missing ESLint / Prettier Config
**Issue:** `package.json` does not include `eslint` or `prettier` in `devDependencies`. The only lint script is `next lint`.
- **Why it's a problem:** Inconsistent code style, missing lint rules for React hooks, security rules, and accessibility rules.
- **Suggested Fix:** Add `eslint-config-next`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `eslint-plugin-security`, and `prettier` to devDependencies. Configure them in `.eslintrc.json` and `.prettierrc`.

---

## 9. Code Quality Issues (MEDIUM)

### 9.1 Massive Commented-Out Code
**Files:**
- `app/admin-page/page.js` (lines 1–39) — entire commented component above the real one
- `app/reset-password/[id]/page.jsx` (lines 1–37) — multiple commented versions
- `app/login-user/[encodedId]/page.js` — commented-out decode logic
- `components/demo/DemoRegister.jsx` (lines 56–75) — commented useEffect
- `app/not-found.js` — multiple commented motion.div blocks
- **Suggested Fix:** Delete all commented-out code. It bloats the file, confuses reviewers, and is preserved in Git history anyway.

---

### 9.2 Duplicate `getUserImage` Function
**Files:** `components/shared/Navbar.jsx`, `components/shared/UserDetails.jsx`, `app/profile/page.js`, `components/pages/players/PlayerImage.jsx`
**Issue:** The same `getUserImage` helper is defined identically in at least 4 files.
- **Suggested Fix:** Extract it into `lib/utils.js` or `helpers/image.js` and import everywhere.

---

### 9.3 Inconsistent Naming Conventions
**Issue:** The codebase mixes naming styles:
- `camelCase`: `loginUser`, `computedLadderName`
- `PascalCase`: `LoginPage`, `AdminPageRouter`
- `snake_case`: `user_id`, `player_status`, `date_of_performance` (API fields)
- `SCREAMING_SNAKE_CASE`: `API_ENDPOINTS`, `STEPS`
- **Suggested Fix:** Standardize on camelCase for JavaScript variables/functions and PascalCase for components. Use snake_case only for API payload keys where the backend requires it.

---

### 9.4 Magic Numbers Everywhere
**Issue:** Hardcoded values with no explanation:
- `timeout: 15000` in `axiosInstance.js`
- `itemsPerPage = 10` in `PerformanceDatabase.jsx`
- `maxVisible = 5` in pagination logic
- `retries < 50` in PayPal script loading (5 seconds of retries)
- `const ageInt = parseInt(formData.age, 10); if (ageInt < 1 || ageInt > 120)` — age bounds
- **Suggested Fix:** Extract magic numbers into named constants at the top of files or in a `constants/app.js` file.

---

### 9.5 `isValidEmail` Has an Overly Restrictive TLD Whitelist
**File:** `lib/utils.js` (lines 75–88)
**Issue:**
```js
const allowedTLDs = ['com', 'in', 'org', 'net', 'edu', 'gov', 'co'];
```
- **Why it's a problem:** This rejects perfectly valid emails like `user@example.io`, `team@company.dev`, `contact@site.uk`, etc. It will cause legitimate users to be blocked during registration.
- **Suggested Fix:** Remove the TLD whitelist. Use a standard email regex (e.g., from `zod` email validation) or the HTML5 `type="email"` validation. If you must restrict domains, use a blacklist of known bad domains, not a TLD whitelist.

---

### 9.6 `user-list/page.js` Is Broken
**File:** `app/user-list/page.js`
**Issue:** The page imports `UserList` but renders only the text `Hello`.
- **Suggested Fix:** Either implement the page properly or remove the route if it's not needed.

---

### 9.7 `player-list/[ladderId]/page.js` Has Incorrect Query Syntax
**File:** `app/player-list/[ladderId]/page.js` (line 5)
**Issue:**
```js
redirect(`/register-user?.ladder_id=${decodedId}`);
```
- **Why it's a problem:** `?.ladder_id` is a malformed query string. It should be `?ladder_id=`. The `?` and `.` are transposed.
- **Suggested Fix:** `redirect(`/register-user?ladder_id=${decodedId}`);`

---

## 10. Hydration Issues (MEDIUM)

### 10.1 `mounted` Pattern Used to Hide Theme Mismatch
**Files:** `components/shared/Navbar.jsx`, `components/shared/Footer.jsx`, `components/pages/payment/PlanHeading.jsx`, `app/terms-and-conditions/page.js`
**Issue:** Components use `const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), []);` to conditionally render theme-dependent UI (e.g., Sun/Moon icons).
- **Why it's a problem:** While this prevents hydration mismatches, it causes a flash of missing content or layout shift on initial load. It's a workaround, not a solution.
- **Suggested Fix:** Render the same initial HTML on server and client. Use CSS-only theming (e.g., `prefers-color-scheme` media queries) or use `next-themes` correctly with the `attribute="class"` approach and avoid rendering different initial HTML.

---

## 11. Memory Leaks (MEDIUM)

### 11.1 `setTimeout` Without Cleanup in `DemoRegister.jsx`
**File:** `components/demo/DemoRegister.jsx` (line 84)
**Issue:** `setTimeout(() => { ... router.push(...) }, 1500);` inside `useEffect` without cleanup.
- **Suggested Fix:** Store the timeout ID and clear it in the cleanup function:
  ```js
  const timer = setTimeout(() => router.push(...), 1500);
  return () => clearTimeout(timer);
  ```

---

### 11.2 `setInterval` in `ActivityList.jsx` Without Cleanup
**File:** `components/pages/players/ActivityList.jsx` (from Grep results)
**Issue:** `setInterval(fetchActivity, 1000)` is started but may not be cleared when the component unmounts.
- **Suggested Fix:** Return a cleanup function from `useEffect`:
  ```js
  const interval = setInterval(fetchActivity, 1000);
  return () => clearInterval(interval);
  ```

---

### 11.3 PayPal Script Not Removed on Unmount
**File:** `app/submit-performance/page.js` (lines 204–235)
**Issue:** The dynamically created `<script>` tag is appended to `document.body` but never removed when the component unmounts or when `showPaymentModal` becomes false.
- **Suggested Fix:** Remove the script in the `useEffect` cleanup function. Better yet, use `@paypal/react-paypal-js` which handles lifecycle automatically.

---

## 12. Routing Issues (MEDIUM)

### 12.1 `useAuthGuard` Redirects to `/404`
**File:** `hooks/useAuthGuard.js` (line 28)
**Issue:**
```js
router.replace("/404");
```
- **Suggested Fix:** Redirect to `/login-page` or `/login-user` with a `?redirect=` parameter. Also, consider returning a 403 status from middleware instead of a client-side redirect.

---

### 12.2 Dynamic Route `[action]/[encodedId]` Has No Error Boundary
**File:** `app/[action]/[encodedId]/page.js`
**Issue:** If `atob(encodedId)` throws, the page redirects to `/404`. If the router operation itself fails, there's no fallback UI.
- **Suggested Fix:** Use a proper error boundary and return a meaningful error message instead of a silent redirect.

---

## 13. Tailwind CSS Issues (LOW–MEDIUM)

### 13.1 Arbitrary Tailwind Values Everywhere
**Issue:** The codebase uses many arbitrary Tailwind values like `w-[25%]`, `h-[680px]`, `max-h-[380px]`, `text-[8px]`, `tracking-[0.08em]`, `bg-[#0D1F35]`, etc.
- **Why it's a problem:** Arbitrary values defeat the purpose of a design system. They make the UI inconsistent and harder to maintain.
- **Suggested Fix:** Define these values in the Tailwind theme configuration (`theme.extend`) or use CSS variables. Limit arbitrary values to one-off exceptions.

---

### 13.2 Invalid Tailwind Class `h-4.5` / `w-4.5`
**File:** `app/profile/page.js` (e.g., lines 409, 494, 509, 526)
**Issue:** `h-4.5` and `w-4.5` are used. Tailwind's default spacing scale does not include `4.5`. It may work if the CSS is generated, but it's non-standard and may fail with Tailwind v4's stricter parser.
- **Suggested Fix:** Use `h-[1.125rem]` (which is 4.5 * 0.25rem) or add `4.5` to the Tailwind spacing scale.

---

### 13.3 Mixing Tailwind with Inline Styles Extensively
**Issue:** Many components use both Tailwind classes and inline `style={{ ... }}` objects. This creates specificity conflicts and makes debugging harder.
- **Suggested Fix:** Move inline styles to CSS variables or Tailwind arbitrary values where possible. Reserve inline styles for truly dynamic values (e.g., computed positions, animations).

---

## 14. Package / Dependency Issues (LOW–MEDIUM)

### 14.1 Redundant `radix-ui` Package
**File:** `package.json` (line 55)
**Issue:** Both `radix-ui` (the monolithic package) and individual `@radix-ui/react-*` packages are installed.
- **Why it's a problem:** `radix-ui` bundles all Radix primitives. The individual packages are already included. This bloats `node_modules` and can cause version conflicts.
- **Suggested Fix:** Remove `radix-ui` from dependencies. Keep only the specific `@radix-ui/react-*` packages you need.

---

### 14.2 `stripe` Package in Frontend
**File:** `package.json` (line 67)
**Issue:** `stripe` is a Node.js SDK for server-side Stripe operations. It should not be in a frontend Next.js app unless it's used in API routes only. Even then, it should be carefully tree-shaken.
- **Suggested Fix:** If used only in API routes, ensure it's not bundled in the client. If not used at all, remove it.

---

### 14.3 `gsap` and `react-fast-marquee` Potentially Unused
**File:** `package.json` (lines 49, 60)
**Issue:** These animation libraries are installed but I did not see them imported in the files I reviewed (except GSAP is not used in the reviewed set).
- **Suggested Fix:** Audit dependencies and remove unused packages. Use `depcheck` or `npm ls` to identify unused packages.

---

### 14.4 No `eslint` or `prettier` in DevDependencies
**File:** `package.json` (lines 72–76)
**Issue:** Only `@tailwindcss/postcss`, `tailwindcss`, and `tw-animate-css` are in devDependencies.
- **Suggested Fix:** Add `eslint`, `eslint-config-next`, `prettier`, and relevant plugins to devDependencies.

---

### 14.5 Next.js 15 + React 19 — Very Bleeding Edge
**File:** `package.json` (lines 52, 56–57)
**Issue:** The project uses Next.js 15.5.7 and React 19.1.0. These are extremely new versions.
- **Why it's a problem:** Many third-party libraries (especially UI libraries, animation libraries, and form libraries) may not yet be fully compatible. You may encounter subtle bugs, hydration issues, or broken peer dependencies.
- **Suggested Fix:** Monitor for compatibility issues with key dependencies (Framer Motion, GSAP, React Hook Form, Radix UI). If stability is a priority, consider downgrading to Next.js 14 + React 18, which is the current LTS stable combination.

---

## Summary of Priority Actions

| Priority | Action | Files / Areas |
|----------|--------|---------------|
| **CRITICAL** | Remove hardcoded APPKEY fallback | `constants/api.js` |
| **CRITICAL** | Move auth tokens from sessionStorage to HTTP-only cookies | `axiosInstance.js`, `userSlice.js`, `loginClub.js`, all pages |
| **CRITICAL** | Sanitize HTML before `dangerouslySetInnerHTML` | `LadderRulesCard.jsx`, `LadderRuleCardUser.jsx` |
| **CRITICAL** | Fix SSRF in download API route | `app/api/download/route.js` |
| **CRITICAL** | Add CSP and security headers | `next.config.mjs` |
| **HIGH** | Remove `"use client"` from root layout | `app/layout.js` |
| **HIGH** | Implement `middleware.js` for auth | Project root |
| **HIGH** | Add TypeScript | Entire project (incremental) |
| **HIGH** | Fix Redux persistence whitelist | `redux/store.js` |
| **HIGH** | Remove `serializableCheck: false` | `redux/store.js` |
| **HIGH** | Use `@paypal/react-paypal-js` instead of script injection | `app/submit-performance/page.js` |
| **MEDIUM** | Delete all commented-out code | `app/admin-page/page.js`, `app/reset-password/[id]/page.jsx`, etc. |
| **MEDIUM** | Extract duplicate `getUserImage` to shared helper | `lib/utils.js` |
| **MEDIUM** | Fix `isValidEmail` TLD whitelist | `lib/utils.js` |
| **MEDIUM** | Fix memory leaks (URL.createObjectURL, setTimeout, setInterval) | `Navbar.jsx`, `DemoRegister.jsx`, `ActivityList.jsx` |
| **MEDIUM** | Remove `images.domains` in favor of `images.remotePatterns` | `next.config.mjs` |
| **LOW** | Audit and remove unused dependencies | `package.json` |
| **LOW** | Add ESLint and Prettier | `package.json` |

---

*End of Report*
