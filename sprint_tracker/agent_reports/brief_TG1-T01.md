# Brief: TG1-T01 — Student Profile Setup Page

**Sprint:** 19  
**Task ID:** TG1-T01  
**Written by:** PM  
**Date:** 2026-04-27

---

## Context

The profile setup page at `apps/web/src/app/profile/setup/page.tsx` already exists with a working 8-avatar picker grid. However, three gaps prevent it from meeting Trial Gate 1 acceptance criteria:

1. **Auth state is not refreshed after saving** — `PUT /me/avatar` updates the database correctly, but `AuthContext` never updates the `user` object stored in `localStorage`. After the student saves their avatar and lands on `/dashboard/student`, the avatar still shows as initials and the "Pick your avatar →" link is still visible.
2. **No display name greeting** — The spec requires "display name confirm". The current page shows a generic "Choose your avatar" heading with no personalisation.
3. **No auth guard** — Unauthenticated visitors can load `/profile/setup` without being redirected.

---

## What to Build

### 1. Add `updateUser` to `AuthContext`

**File:** `apps/web/src/components/providers/auth-provider.tsx`

Add an `updateUser` method that merges a partial `AuthUser` into the current user state and persists it to `localStorage`:

```ts
// Add to AuthContextValue interface:
updateUser: (partial: Partial<AuthUser>) => void;

// Add to AuthProvider (inside component, using useCallback):
const updateUser = useCallback((partial: Partial<AuthUser>) => {
  setUser((prev) => {
    if (!prev) return prev;
    const next = { ...prev, ...partial };
    localStorage.setItem(USER_KEY, JSON.stringify(next));
    return next;
  });
}, []);

// Include in context value: { user, token, login, logout, updateUser }
```

Export the updated `AuthContextValue` type with the new field.

---

### 2. Fix the Profile Setup Page

**File:** `apps/web/src/app/profile/setup/page.tsx`

Make three changes:

**a) Auth guard** — Add a `useEffect` that redirects to `/login` if the auth hydration is complete and there is no token:

```ts
// After existing state declarations, add:
const [hydrated, setHydrated] = useState(false);

useEffect(() => {
  setHydrated(true);
}, []);

useEffect(() => {
  if (hydrated && !token) {
    router.replace('/login');
  }
}, [hydrated, token, router]);
```

**b) Display name greeting** — Replace the current `<h1>Choose your avatar</h1>` block with:

```tsx
<h1 className="text-2xl font-bold text-slate-800 mb-1">
  Hi, {user?.displayName ?? user?.username ?? 'there'}! 👋
</h1>
<p className="text-slate-500 text-sm mb-6">
  Pick a character that represents you.
</p>
```

**c) Refresh auth state after save** — Import `updateUser` from `useAuth()` and call it after a successful `updateAvatar()`:

```ts
const { user, token, updateUser } = useAuth();

// In handleSave, after await updateAvatar(selected, token):
updateUser({ avatarSlug: selected });
router.push('/dashboard/student');
```

---

## Files to Modify

| File | Change |
|---|---|
| `apps/web/src/components/providers/auth-provider.tsx` | Add `updateUser` to context interface and implementation |
| `apps/web/src/app/profile/setup/page.tsx` | Auth guard + display name greeting + call `updateUser` after save |

**No backend changes.** No new files. No Prisma migrations.

---

## Acceptance Criteria

1. `/profile/setup` shows `"Hi, {displayName}! 👋"` (falls back to `username` or `"there"` if displayName is absent).
2. Unauthenticated visitors to `/profile/setup` are redirected to `/login`.
3. After selecting an avatar and clicking "Save Avatar":
   - `user.avatarSlug` in `AuthContext` and `localStorage` is updated immediately.
   - The student is redirected to `/dashboard/student`.
   - The dashboard renders the selected emoji avatar, not initials.
   - The "Pick your avatar →" prompt is not shown on the dashboard.
4. The "Skip" link still works (redirects to `/dashboard/student` without updating `avatarSlug`).
5. `pnpm --filter @koblio/web build` (or `tsc --noEmit`) passes with no TypeScript errors.

---

## Gotchas

- `AuthProvider` initialises from `localStorage` in a `useEffect`, so on the first render `token` is `null` even for logged-in users. The auth guard **must** wait for hydration before redirecting, or it will bounce logged-in students to `/login`.
- `AuthContextValue` is an interface — remember to add `updateUser` there **and** to the `createContext` default (use a no-op: `updateUser: () => undefined`).
- The `updateAvatar` API function returns `{ id, displayName, avatarSlug }` — DEV may use the returned `avatarSlug` if they prefer over using the locally selected `slug`.
