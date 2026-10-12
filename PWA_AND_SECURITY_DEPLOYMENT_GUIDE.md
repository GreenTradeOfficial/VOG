# Vessel of Grace Christian Center (VOG)
## Progressive Web App (PWA) & Security Architecture Guide

This document summarizes the complete production-grade transformation performed on the **Vessel of Grace Christian Center (VOG)** application, covering PWA installability, two separate user experiences, server-side authorization, database persistence, and deployment instructions.

---

### 1. Root Cause of the Previous Security Vulnerability & How It Was Fixed

#### The Problem
When the previous build was opened on another phone or browser, visitors were able to see or enter the church administrator interface because:
1. `Header.tsx` contained an open, unsecured client toggle button (`<button onClick={() => setIsAdminMode(!isAdminMode)}>Admin</button>`) accessible to anyone.
2. `MoreMenuModal.tsx` had an "Enter Admin" button that directly called `setIsAdminMode(true)`.
3. `AdminDashboard.tsx` had zero authentication or permission checks — it rendered immediately with full editorial controls.
4. Content mutations (lifts, devotions, sermons, events, announcements) only lived in React state and `localStorage`, meaning anyone could click "Reset Sample Data" or modify local items without server authentication.

#### The Permanent Fix
1. **Zero Client-Side Mode Overrides**: Removed all insecure client toggle buttons. The `isAdminMode` flag is now strictly computed asynchronously on the server: `checkIfUserIsAdmin(currentUser)`.
2. **Dedicated Pastoral Gateway (`AdminLoginGateway.tsx`)**:
   - If an unauthenticated visitor navigates to the Admin Portal, they are greeted by a secure **Vessel of Grace Pastoral Gateway**.
   - If a signed-in **regular church member** attempts to access administrative functions, they are immediately met with an explicit **"Access Restricted — Church Member Account"** barrier.
3. **Server-Side Authorization via Firestore Rules**:
   - `firestore.rules` enforces that **only verified administrators** can create, modify, or delete church sermons, events, announcements, daily lifts, daily devotions, and anniversary profiles.
   - Private prayer requests can only be viewed by church administrators or the member who submitted them.
   - Any client-side forgery or malicious request from an unauthorized device is rejected with HTTP 403 / `permission-denied`.

---

### 2. How to Securely Authorize Your Administrator Account Without Publishing Secrets

You do **not** need to put passwords or secrets into the frontend code to authorize church leaders.

#### Method A: Pre-Configured Administrator Email
The root administrator email `mehedebaedmond@gmail.com` is pre-authorized in the security rules:
```javascript
function isAdmin() {
  return isSignedIn() && (
    request.auth.token.email == 'mehedebaedmond@gmail.com' ||
    exists(/databases/$(database)/documents/admins/$(request.auth.uid))
  );
}
```
Simply click **"Google Authorized Pastor Sign-In"** in the Admin Portal and select `mehedebaedmond@gmail.com` (or sign in with that email and password). You will immediately be granted full administrative authority.

#### Method B: Authorizing Any Additional Church Leader or Pastor
To grant administrative access to another church leader (e.g. Senior Pastor West Somina or an assistant pastor) without redeploying code:
1. Have the leader sign up in the app once (via Email or Google Sign-In).
2. Open the [Firebase Console](https://console.firebase.google.com/) &rarr; select project `ai-studio-vesselofgracechr-ebaf48be-7cf1-404f-a209-8f4be2c56506`.
3. Go to **Authentication** &rarr; copy the user's **UID** (e.g. `u5XyZ...`).
4. Go to **Firestore Database** &rarr; open or create the collection named `admins`.
5. Create a new document with:
   - **Document ID**: `<The Leader's Firebase Auth UID>`
   - **Fields**:
     ```json
     {
       "email": "pastor@vogcenter.org",
       "displayName": "Pastor West Somina",
       "role": "admin",
       "authorizedBy": "Senior Pastor West Somina",
       "createdAt": "2026-10-12T00:00:00.000Z"
     }
     ```
6. The moment this document exists, the rule `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` activates on Google Cloud. When that user opens the app on their phone, they have full pastoral administration authority. Ordinary visitors will continue to have zero access.

---

### 3. How to Test Member vs. Administrator Access on Another Phone

Follow these steps to verify that ordinary users cannot access admin controls:

1. **Test 1: Unauthenticated Visitor on Another Phone**
   - Open the app link on any smartphone in an incognito or normal browser window.
   - Note that the top header shows clean congregation actions: **Live Service**, **Favorites**, **Sign In**, and **More**. There is **no** Admin toggle button.
   - Open the **More** menu or footer and tap **"Pastoral Staff & Admin Gateway"**.
   - Notice that the app does **not** open the dashboard. Instead, it displays the secure **Church Administrator Portal login gateway**.
   - Attempting to inspect or forge local variables will not work because the backend rules reject unauthorized database writes.

2. **Test 2: Normal Church Member Registration**
   - On that phone, tap **Sign In** &rarr; **Join the Fellowship / Create Account**.
   - Sign up with an ordinary email (e.g. `member.test@gmail.com`).
   - The user is created with `role: "member"`.
   - The user can save sermons to favorites, view devotionals, track spiritual activity, and submit confidential prayer requests.
   - Now, attempt to click the Admin link in the footer or navigate to the admin portal.
   - The app displays the **"Administrative Access Restricted"** barrier:
     > *"Your account (member.test@gmail.com) is registered as a Church Member. Non-administrative account."*
   - Ordinary members are completely blocked from church content management.

3. **Test 3: Authorized Administrator**
   - Sign in with `mehedebaedmond@gmail.com` or any account registered in `/admins/{uid}`.
   - The app detects administrator authorization, displays the **Active Admin Portal** gold badge, and unlocks the full **VOG Administration Dashboard**.

---

### 4. Progressive Web App (PWA) Implementation & Verification

#### Manifest Specifications (`vite.config.ts` & `/public` assets)
- **Application Name**: `Vessel of Grace Christian Center`
- **Short Name**: `VOG Church` (&le; 12 characters to prevent truncation on Android home screens)
- **Start URL & Scope**: `/`
- **Display Mode**: `standalone` (removes mobile browser address bar and navigation frame, rendering like a native Android APK)
- **Theme Color**: `#0B2545` (Deep Navy Blue matching the church status bar)
- **Background Color**: `#0B2545` (Navy splash screen while loading)
- **Icons Generated**:
  - `pwa-192x192.png`: 192&times;192 PNG (`purpose: "any"`)
  - `pwa-512x512.png`: 512&times;512 PNG (`purpose: "any"`)
  - `pwa-maskable-512x512.png`: 512&times;512 PNG with 15% inner safe zone padding (`purpose: "maskable"`)
  - `apple-touch-icon.png`: 180&times;180 PNG for iOS Safari home screen bookmarking
  - `favicon.svg`: High-resolution Vector SVG emblem

#### Service Worker & Safe Offline Caching
- Configured using `vite-plugin-pwa` with `Workbox`.
- Static HTML, JS, CSS, and Google Fonts are precached for instant launch.
- **Privacy Enforcement**: Private user profiles, authentication tokens (`/identitytoolkit`), and confidential prayer requests are **never cached** by the service worker.
- **Offline Detection**: Built-in `PwaInstallPrompt` detects when an Android device goes offline and displays a non-intrusive alert: *"Offline Mode — Cached devotionals & sermons available."*

#### In-App Installation Prompt
- Implemented in `src/components/PwaInstallPrompt.tsx`.
- Captures the Android `beforeinstallprompt` event and shows a floating installation banner: *"Install VOG Church App — Add to home screen for fast Android access & offline devotionals."*
- Tapping **"Install App"** triggers the native browser installation dialog without requiring third-party app store downloads.

---

### 5. Persistent Firestore Collections & Realtime Church Sync

The following collections are persistently wired into Cloud Firestore (`churchContentService.ts`):

| Collection | Purpose | Read Permission | Write Permission |
| :--- | :--- | :--- | :--- |
| `/sermons/{id}` | Sermons, recordings, and scripture notes | Public | Admin Only |
| `/events/{id}` | Church calendar and service schedules | Public | Admin Only |
| `/announcements/{id}` | Official notices and urgent ministry alerts | Public | Admin Only |
| `/dailyLifts/{id}` | Pastor's daily encouragement lifts | Public | Admin Only |
| `/dailyDevotions/{id}` | Daily devotionals with scripture and prayer | Public | Admin Only |
| `/prayerRequests/{id}` | Confidential prayer requests from brethren | Petitioner + Admin | Admin Only |
| `/anniversaryGuests/{id}` | 10th Anniversary guest ministers and speakers | Public | Admin Only |
| `/users/{id}` | Member profile data | Owner + Admin | Owner + Admin |
| `/users/{id}/favorites` | Member saved favorites cloud sync | Owner + Admin | Owner + Admin |
| `/users/{id}/activity` | Member spiritual activity log | Owner + Admin | Owner + Admin |
| `/admins/{uid}` | Administrator RBAC registry | Owner + Admin | Backend Only |
| `/liveConfig/{id}` | Sanctuary live broadcast settings | Public | Admin Only |
| `/liveChatMessages/{id}` | Realtime congregation live service chat | Public | Congregation (Validated) |

---

### 6. Production Build & Deployment Checklist

1. **Build the Application**:
   ```bash
   npm run build
   ```
2. **HTTPS Deployment Requirement**:
   - Progressive Web Apps require **HTTPS** (or `localhost` for development) for Service Worker registration, Web App Manifest installation, and Google OAuth popups.
   - When deployed to Cloud Run, Firebase Hosting, Vercel, or custom domain (e.g. `https://app.vogcenter.org`), HTTPS is provisioned automatically with SSL certificate termination.
3. **PWA Lighthouse Audit Compliance**:
   - Manifest valid: Yes
   - Service worker registered: Yes
   - Maskable icon provided: Yes
   - Standalone display configured: Yes
   - Apple Touch Icon provided: Yes
