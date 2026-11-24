# PLATO authentication

## Decisions

- Clerk is the identity provider.
- Account registration is open. Planned methods: email and password, Google, and Apple.
- Guests may join online matches. Bot-only play remains a separate local mode and does not require a Clerk account.
- Account creation requires email verification. The visible player name is set during registration and cannot be changed in the initial product flow.
- Account recovery and account deletion are required. Global sign-out and linking/unlinking identity providers are outside the initial scope.
- The sign-in and registration screens will use PLATO's own design and will be built during full frontend/API integration.
- API bearer tokens must include `aud: "plato-api"`; the Go backend must continue validating issuer, audience, signature, expiry, and issued-at claims.
- Online guests use a PLATO-issued temporary identity, not a Clerk account. They choose a display name before joining, their credential stays in secure storage on that device, and the identity expires after seven days without activity. The same guest identity is not supported across multiple devices.
- A guest can convert to a Clerk account and retain their PLATO data. If that account and guest already share a match, conversion is rejected because one account cannot occupy two seats in a match.
- Deleting a Clerk account removes its identity and personal display name. Shared matches remain with the deleted player's seat anonymized.

## Current frontend wiring

`PlatoAuthProvider` initializes Clerk only when `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is set. Without the key, the local bot flow remains available and auth state reports unconfigured. `usePlatoAuth()` exposes only the current auth state and a method to obtain a Clerk session token for the future API client.

The current app does not yet expose account screens or connect match gameplay to the API. `guestSession.ts` implements guest creation, device-local credential storage, conversion to a Clerk account, and the one-time profile-name call. After adding a Clerk instance key, configure the Clerk session token in its dashboard with the `aud` claim set to `plato-api`, then configure the Go backend with the matching Clerk issuer, JWKS URL, audience, and webhook signing secret. Never place Clerk secret keys in the app.

Guest credentials use a separate backend-issued opaque bearer token with a server-side hash, a seven-day idle expiry, revocation on account conversion, and anonymization of expired guest data. Guest identity creation is rate-limited. Never accept the guest's player ID from request payloads. Native clients store the credential in SecureStore with device-only keychain accessibility; web clients keep it in the current tab's session storage. The service does not provide guest credential export or cross-device recovery.

## Native app setup still needed

Before enabling production OAuth callbacks, set stable iOS bundle and Android application identifiers, register the native app in Clerk, and configure Google/Apple credentials. These identifiers are intentionally left unset until the app IDs are chosen.

Adding Clerk's Expo config plugin changes native configuration. Rebuild the development client before testing native auth flows.
