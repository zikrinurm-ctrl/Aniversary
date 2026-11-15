# Security Specification — Zikri & Diann: Our Little World

## 1. Data Invariants
1. **Admin Authority**: Only verified Firebase Auth accounts matching the owner email (`zikrinurm@gmail.com`) or listed in `/admins/{uid}` may create, update, or delete `/siteConfig`, `/memories`, `/timeline`, `/songs`, `/truthOrDare`, `/quizQuestions`, `/loveLetters`, and `/admins`.
2. **Identity Integrity**: All write operations require `incoming().ownerUid == request.auth.uid` and `request.auth.token.email_verified == true`.
3. **Immutability**: `createdAt` and `ownerUid` cannot be modified after document creation.
4. **Temporal Integrity**: `createdAt` on create and `updatedAt` on update must equal `request.time`.
5. **Strict Keys & Size Bounds**: Every document write must pass `keys().hasAll(...)` and `keys().hasOnly(...)` with strict string/array `.size()` bounds and regex ID validation (`^[a-zA-Z0-9_-]+$`, max 128 chars).
6. **PII Isolation**: `/admins/{adminId}` contains email PII and is strictly restricted to `isSignedIn() && request.auth.token.email_verified == true && (request.auth.uid == adminId || isAdmin())`, with `list` disabled.
7. **Safe List Queries**: Public content collections (`memories`, `timeline`, `songs`, `truthOrDare`, `quizQuestions`, `loveLetters`, `promises`) enforce `resource.data.isPublic == true` in `allow list` rules without `get()`/`exists()` lookups.

## 2. The "Dirty Dozen" Payloads (Attack Vectors)
1. **Unauthenticated Write**: Creating a `/memories/hack1` document with `request.auth == null` -> `PERMISSION_DENIED`.
2. **Non-Admin SiteConfig Hijack**: Authenticated non-admin user updating `/siteConfig/main` `secretMessage` -> `PERMISSION_DENIED`.
3. **Email Spoofing**: User with `email == 'zikrinurm@gmail.com'` but `email_verified == false` writing `/siteConfig/main` -> `PERMISSION_DENIED`.
4. **Shadow Field Injection**: Admin creating `/songs/s1` with extra ghost field `isAdmin: true` -> `PERMISSION_DENIED`.
5. **ID Poisoning**: Creating `/memories/bad..id!@#` or 200-char ID -> `PERMISSION_DENIED`.
6. **Resource Exhaustion (1MB String)**: Admin creating `/loveLetters/l1` with `body` > 3000 chars -> `PERMISSION_DENIED`.
7. **Identity Spoofing on Promise**: Verified user creating `/promises/p1` with `ownerUid: 'other_uid'` -> `PERMISSION_DENIED`.
8. **Immutable Field Tampering**: Updating `/promises/p1` and changing `createdAt` or `ownerUid` -> `PERMISSION_DENIED`.
9. **Client Timestamp Spoofing**: Creating `/memories/m1` with `createdAt` set to a past client timestamp instead of `request.time` -> `PERMISSION_DENIED`.
10. **PII Scrape on Admins**: Non-admin authenticated user executing `get` or `list` on `/admins` -> `PERMISSION_DENIED`.
11. **Unbounded Options Array**: Admin creating `/quizQuestions/q1` with 10 options or non-string option -> `PERMISSION_DENIED`.
12. **Blanket List Without Public Filter**: Querying `/memories` without `where('isPublic', '==', true)` as non-admin -> `PERMISSION_DENIED`.
