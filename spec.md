# ProFi Mine

## Current State
Admin dashboard at `/admin` uses password-based entry (`k0R1@#ch_7251!`). The password verification consistently fails with "Verification failed. Please try again." even when the correct password is entered.

## Requested Changes (Diff)

### Add
- `isAdminSafe` function to `access-control.mo` (was referenced in `main.mo` but never defined, causing compilation issues)

### Modify
- `useActor.ts`: Remove `_initializeAccessControlWithSecret(adminToken)` call (root cause — traps backend when env var is not set, making actor null, causing all subsequent calls including `claimAdminWithPassword` to throw). Replace with `registerUser()` which is safe.
- `MixinAuthorization.mo`: Fix `_initializeAccessControlWithSecret` to silently return instead of trapping when `CAFFEINE_ADMIN_TOKEN` env var is not set. Fix `isCallerAdmin` and `getCallerUserRole` to return safe defaults instead of trapping for unregistered principals.
- `access-control.mo`: Add `isAdminSafe` function that returns false for unregistered/anonymous principals without trapping.

### Remove
- Nothing removed

## Implementation Plan
1. Add `isAdminSafe` to `access-control.mo`
2. Update `MixinAuthorization.mo` to not trap, use safe defaults
3. Fix `useActor.ts` to call `registerUser()` instead of `_initializeAccessControlWithSecret`
