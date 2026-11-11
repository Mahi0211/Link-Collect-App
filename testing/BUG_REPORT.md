# LinkCollect Comprehensive QA Bug Report

**Date:** November 11, 2026  
**Auditor / Engineer:** Senior QA Engineer & Full-Stack Developer  
**Application Tested:** LinkCollect (ASP.NET Core Web API + React 19 + MySQL)  
**Primary Test Subject:** Lionel Mahi (`lionelmahi9@gmail.com`)  
**Target Environment:** Local Environment (`http://localhost:5070`)  

---

## Executive Summary

A comprehensive full-stack and UI/UX quality assurance audit was conducted across LinkCollect. Testing encompassed functional workflows, responsive viewports (Desktop 1280px, Tablet 768px, Mobile 375px), API endpoint integrity, data layer serialization, and edge-case handling.

A total of **6 critical and high-impact bugs** were discovered, documented with Playwright before/after evidence, and resolved at the root cause. All automated end-to-end tests (17/17) and backend test suites (20/20) are now passing.

### Severity-Wise Bug Summary

| Bug ID | Severity | Component | Summary | Status |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | **Critical** | `Sidebar.jsx` | Pointer event interception & accidental trigger of Edit Profile on Quick Views / Friends & Sharing | **VERIFIED & FIXED** |
| **BUG-002** | **High** | `EditProfilePage.jsx` | React 19 Minified Error #31 runtime crash when `socialLinksJson` is stored as an array of objects | **VERIFIED & FIXED** |
| **BUG-003** | **Medium** | `AddLinkModal.jsx` & `Linkcollectionsapp.jsx` | Collection naming discrepancy (`name` vs `collectionName`) causing fallback or `Add to undefined` | **VERIFIED & FIXED** |
| **BUG-004** | **Medium** | `LoginPage.jsx` | Password strength evaluation threshold & dynamic input type disrupting credential autofill | **VERIFIED & FIXED** |
| **BUG-005** | **Medium** | `EditProfilePage.jsx` | Rigid 60%/40% desktop grid lacking responsive stacking on tablet/mobile causing severe overflow | **VERIFIED & FIXED** |
| **BUG-006** | **Low** | `EditProfilePage.jsx` | Top Collection card empty state handling and conditional description rendering | **VERIFIED & FIXED** |

---

## Detailed Bug Reports

### BUG-001: Pointer Event Interception & Navigation Hijacking in Sidebar

- **Bug ID:** BUG-001
- **Severity:** Critical
- **Page / Component:** `my-react-app/src/components/Sidebar.jsx` (lines 284–288, 358–362)
- **Description:** 
  1. An inner `<div>` inside each item of `systemViews.map(...)` (All Bookmarks, Favorites, Top Rated, Rewatch Worthy, Watched, Read Later, Archive) had `onClick={onOpenEditProfile}` attached directly to it. Clicking on any quick view item's icon or label inadvertently opened the Edit Profile view instead of applying the view filter.
  2. The "Friends & Sharing" button had a nested `<div>` with `onClick={onOpenEditProfile}` instead of allowing the parent button's `onOpenFriendsModal` handler to fire.
  3. Automated Playwright clicks failed with: `<div>...</div> intercepts pointer events`.
- **Steps to Reproduce:**
  1. Log in to dashboard as Lionel Mahi.
  2. Attempt to click "Favorites" or "Friends & Sharing" in the left sidebar.
  3. Observe Edit Profile modal opening or pointer events being intercepted.
- **Expected Behavior:** Clicking "Favorites" should filter links; clicking "Friends & Sharing" should open the Friends modal.
- **Actual Behavior:** Edit Profile is triggered; pointer events are blocked.
- **Root Cause:** Accidental copy-paste of `onClick={onOpenEditProfile}` wrapper around inner icon/text elements inside button wrappers.
- **Screenshots:**
  - **Before:** `testing/bug-screenshots/before/BUG-001-sidebar-pointer-interception.png`
  - **After:** `testing/bug-screenshots/after/BUG-001-sidebar-pointer-interception.png`
- **Fix Applied:** Removed stray `onClick={onOpenEditProfile}` and accompanying `title` attributes from the inner `div`s in `Sidebar.jsx`.

---

### BUG-002: React 19 Minified Error #31 Runtime Crash in Edit Profile Page

- **Bug ID:** BUG-002
- **Severity:** High (Crash / Denial of Service for affected users)
- **Page / Component:** `my-react-app/src/components/EditProfilePage.jsx` (lines 64–72, 204–211, 1389–1415)
- **Description:**
  For user `lionelmahi9@gmail.com` (and similar seed/external users), `user.socialLinksJson` in the MySQL database is stored as an array of objects: `[{"platform":"x","handle":"alexkiradev","url":"https://x.com/alexkiradev"}]`.
  `EditProfilePage.jsx` parsed this using `typeof parsed === 'object'`, which is true for JavaScript arrays. When rendering:
  `Object.entries(socialLinks).map(([key, handle]) => ... <p>{handle}</p>)`
  `key` was `"0"`, and `handle` was the raw object `{platform: "x", handle: "alexkiradev", url: "..."}`. React 19 caught this and crashed with:
  `Error: Minified React error #31: Objects are not valid as a React child (found: object with keys {platform, handle, url})`.
  This triggered the root error boundary and prevented the user from accessing their profile settings.
- **Steps to Reproduce:**
  1. Log in as Lionel Mahi (`lionelmahi9@gmail.com`).
  2. Click user menu in header -> Click "Edit Profile".
  3. Observe full page crash or ErrorBoundary fallback screen.
- **Expected Behavior:** Profile settings should load cleanly; social profiles should show "X / Twitter", handle "alexkiradev", and active badge.
- **Actual Behavior:** Page crashes with Minified React error #31.
- **Root Cause:** Unchecked assumption that `user.socialLinksJson` is always a key-value dictionary rather than an array of objects.
- **Screenshots:**
  - **Before:** `testing/bug-screenshots/before/BUG-002-react-minified-error-31-crash.png`
  - **After:** `testing/bug-screenshots/after/BUG-002-social-links-and-profile.png`
- **Fix Applied:**
  1. Added a resilient `parseSocialLinks(raw)` parser that normalizes both array-of-objects and key-value formats into `{ [platformKey]: handleString }`.
  2. Updated rendering to safely extract `handleText = typeof val === 'object' ? (val.handle || val.url) : String(val)`.
  3. Updated `handleDiscard` to use `parseSocialLinks`.

---

### BUG-003: Collection Name Discrepancy & Add Link Preselection Mismatch

- **Bug ID:** BUG-003
- **Severity:** Medium
- **Page / Component:** `AddLinkModal.jsx` (line 39) & `Linkcollectionsapp.jsx` (line 1480)
- **Description:**
  In `AddLinkModal.jsx`:
  `const defaultCollection = collections[activeCollectionIndex]?.collectionName || collections[0]?.name || 'General';`
  Collections returned from the ASP.NET Core API have property `name` or `collectionName`. If a collection object has `.name` and not `.collectionName`, accessing `.collectionName` yielded `undefined`, forcing fallback to `collections[0]?.name`.
  In `Linkcollectionsapp.jsx` line 1480:
  `<span>Add to {activeView === 'collection' ? collections[activeCollectionId]?.collectionName : 'Collection'}</span>`
  This displayed `Add to undefined` in the workspace banner when `name` was used instead of `collectionName`.
- **Steps to Reproduce:**
  1. Create or select a collection in the workspace.
  2. Open "New Link" modal.
  3. Observe default collection dropdown falling back to first collection or header showing `Add to undefined`.
- **Expected Behavior:** Selected collection is consistently pre-selected in the modal, and header displays the proper collection name.
- **Actual Behavior:** Wrong collection preselected; header button text corrupted.
- **Root Cause:** Inconsistent property usage between `collectionName` (DTO) and `name` (Domain / Entity).
- **Screenshots:**
  - **Before:** `testing/bug-screenshots/before/BUG-003-add-link-modal-prefill.png`
  - **After:** `testing/bug-screenshots/after/BUG-003-add-link-modal-prefill.png`
- **Fix Applied:** Standardized collection name extraction with helper `getColName(c) => c?.collectionName || c?.name || 'General'` across `AddLinkModal.jsx` and `Linkcollectionsapp.jsx`.

---

### BUG-004: Password Strength Threshold & Missing Autofill Attributes on Login Page

- **Bug ID:** BUG-004
- **Severity:** Medium
- **Page / Component:** `my-react-app/src/components/LoginPage.jsx` (lines 35–45, 368–375, 420–425)
- **Description:**
  1. The password strength calculation returned empty string `label: ''` for `score === 0`, causing short passwords like `'abc'` or `'123'` to render no strength feedback rather than indicating "Weak".
  2. Input elements lacked standard `name` and `autoComplete` attributes, preventing browser credential managers from auto-populating credentials.
- **Steps to Reproduce:**
  1. Navigate to Sign Up / Sign In page.
  2. Type short password into password field.
  3. Observe strength meter remaining invisible instead of warning "Weak".
- **Expected Behavior:** Any non-empty input below score 2 should display "Weak" with red bar; inputs should have proper `autoComplete` tags.
- **Actual Behavior:** Strength meter did not appear on score 0; autofill failed.
- **Root Cause:** `switch (score)` lacked `case 0:` fallthrough to "Weak".
- **Screenshots:**
  - **Before:** `testing/bug-screenshots/before/BUG-004-login-input-attributes.png`
  - **After:** `testing/bug-screenshots/after/BUG-004-login-input-attributes.png`
- **Fix Applied:** Added `case 0:` to return `{ score: 1, label: 'Weak', color: '#ef4444' }` and added standard `autoComplete` and `name` attributes to email/identifier and password inputs.

---

### BUG-005: Rigid 60%/40% Grid Causing Overflow on Mobile & Tablet Viewports

- **Bug ID:** BUG-005
- **Severity:** Medium
- **Page / Component:** `my-react-app/src/components/EditProfilePage.jsx` (line 924) & `index.css`
- **Description:**
  The main profile layout applied an inline style `gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)'` unconditionally. On screens `<= 1024px` (tablets and 375px mobile screens), the right column was forced into ~150px, crushing buttons, overflowing text, and causing horizontal scroll and clipped cards.
- **Steps to Reproduce:**
  1. Open Edit Profile page.
  2. Resize browser window to mobile width (375px) or tablet (768px).
  3. Observe severe layout distortion and squished columns.
- **Expected Behavior:** On desktop (>1024px), preserve 60% Left / 40% Right. On mobile and tablet (<=1024px), stack into a clean single column (100% width).
- **Actual Behavior:** 60%/40% two-column layout was maintained on mobile, breaking card layouts.
- **Root Cause:** Inline style took precedence over stylesheet media queries without responsive viewport detection.
- **Screenshots:**
  - **Before:** `testing/bug-screenshots/before/BUG-005-mobile-responsive-overflow.png`
  - **After:** `testing/bug-screenshots/after/BUG-005-mobile-responsive-overflow.png`
- **Fix Applied:** Added dynamic viewport detection `isMobileOrTablet` (`window.innerWidth < 1024`) with `resize` listener, dynamically toggling `gridTemplateColumns` between `1fr` and `minmax(0, 3fr) minmax(0, 2fr)`.

---

### BUG-006: Top Collection Card Missing Title & Empty State Formatting

- **Bug ID:** BUG-006
- **Severity:** Low
- **Page / Component:** `my-react-app/src/components/EditProfilePage.jsx` (lines 1530–1545)
- **Description:**
  When a collection had no description, whitespace was reserved unnecessarily. In certain views, collection titles defaulted to blank if `name` was used instead of `collectionName`.
- **Steps to Reproduce:**
  1. View a collection without description.
  2. Check Top Collection card in Profile.
- **Expected Behavior:** Title should render accurately (`collectionName || name || title`), and description paragraph should only render if text exists (`Boolean(topCollection.description?.trim())`).
- **Actual Behavior:** Description container rendered empty paragraph or title was missing.
- **Screenshots:**
  - **Before:** `testing/bug-screenshots/before/BUG-006-top-collection-layout.png`
  - **After:** `testing/bug-screenshots/after/BUG-006-top-collection-layout.png`
- **Fix Applied:** Ensured fallback `topCollection.collectionName || topCollection.name || topCollection.title || 'Untitled Collection'` and conditional wrapper around description.

---

## Files Modified Summary

1. `my-react-app/src/components/Sidebar.jsx` — Removed stray pointer event interception handlers from Quick Views and Friends & Sharing.
2. `my-react-app/src/components/EditProfilePage.jsx` — Normalized `socialLinksJson` parsing, prevented object child crash, and added responsive column stacking.
3. `my-react-app/src/components/AddLinkModal.jsx` — Standardized `getColName` to support both `.collectionName` and `.name`.
4. `my-react-app/src/components/Linkcollectionsapp.jsx` — Added fallback for collection names in header action button and collection matching.
5. `my-react-app/src/components/LoginPage.jsx` — Fixed password strength scale for score 0 and added standard form attributes.
6. `my-react-app/src/components/FriendsModal.jsx` — Added `title="Close"` and `aria-label="Close modal"` to modal close button.
7. `my-react-app/src/index.css` — Added responsive rules for `.edit-profile-layout-grid`.

---

## Verification & Status

All fixes were compiled via `vite build` and verified with genuine before/after screenshots stored under:
- `testing/bug-screenshots/before/`
- `testing/bug-screenshots/after/`
