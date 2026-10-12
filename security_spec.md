# Security Specification & Threat Model

## Application: Vessel of Grace Christian Center (VOG)
### Target Resource: `anniversaryGuests/{guestId}` and `admins/{adminId}`

---

## 1. Data Invariants

1. **Identity & Authorization Invariant**:
   - Only authorized church administrators (`isAdmin()`) can write, modify, reorder, or delete anniversary guest profiles and associated storage metadata.
   - Bootstrapped administrator identity is verified via `request.auth.token.email == 'mehedebaedmond@gmail.com' && request.auth.token.email_verified == true` or inclusion in `/admins/{uid}`.
   - Anonymous and unauthenticated visitors have zero write/update/delete permissions.

2. **Public Read Invariant**:
   - Public visitors (both unauthenticated and authenticated) are permitted to read published guest profiles (`resource.data.isPublished == true`).
   - Query listing MUST enforce that only published records are accessible by the public, preventing scraping of unpublished or draft profiles.

3. **Schema & Volumetric Boundaries**:
   - `fullName`: required string, length 1–200 characters.
   - `role`: required string, length 1–100 characters.
   - `ministry`: optional string, length ≤ 200 characters.
   - `biography`: optional string, length ≤ 2,000 characters.
   - `photoUrl`: optional string, length ≤ 2,000 characters (Firebase Storage download URL).
   - `photoStoragePath`: optional string, length ≤ 500 characters.
   - `displayOrder`: required integer, range 0–1,000.
   - `isPublished`: optional boolean.
   - Strict key enforcement: No unknown, shadow, or injection keys permitted (`data.keys().hasOnly(...)`).

4. **Temporal & Immutability Invariant**:
   - `createdAt` must strictly equal server timestamp `request.time` upon creation.
   - `createdAt` is immutable: updates must preserve `incoming().createdAt == existing().createdAt`.
   - `updatedAt` must strictly equal server timestamp `request.time` upon update.

5. **Path Hardening Invariant**:
   - `guestId` must be a valid alphanumeric string matching `^[a-zA-Z0-9_\-]+$` and length ≤ 128 characters.

---

## 2. The "Dirty Dozen" Threat Payloads

| Payload ID | Attack Vector | Malicious Intent / Vector | Expected Result |
| :--- | :--- | :--- | :--- |
| **PAYLOAD-01** | Anonymous Write | Unauthenticated attacker attempts `create` on `/anniversaryGuests/hacker1` | `PERMISSION_DENIED` |
| **PAYLOAD-02** | Shadow Key Injection | Attacker injects shadow field `isAdmin: true` into guest payload | `PERMISSION_DENIED` |
| **PAYLOAD-03** | Email Spoof Attack | Attacker authenticates with `mehedebaedmond@gmail.com` but `email_verified: false` | `PERMISSION_DENIED` |
| **PAYLOAD-04** | Timestamp Tampering | Attacker supplies client-side spoofed `createdAt: "1999-01-01"` instead of `request.time` | `PERMISSION_DENIED` |
| **PAYLOAD-05** | Creation Timestamp Mutation | Attacker attempts to overwrite original `createdAt` timestamp during an update | `PERMISSION_DENIED` |
| **PAYLOAD-06** | ID Path Poisoning | Attacker sends a 5KB path containing `../../` or path traversal characters | `PERMISSION_DENIED` |
| **PAYLOAD-07** | Denial of Wallet (Name) | Attacker sends a 500KB string for `fullName` to cause bandwidth exhaustion | `PERMISSION_DENIED` |
| **PAYLOAD-08** | Denial of Wallet (Bio) | Attacker sends a 1MB string for `biography` exceeding volumetric quota | `PERMISSION_DENIED` |
| **PAYLOAD-09** | Type Poisoning (Order) | Attacker sends `displayOrder: "one"` (string instead of integer) | `PERMISSION_DENIED` |
| **PAYLOAD-10** | Missing Required Keys | Attacker attempts create omitting `fullName` or `role` | `PERMISSION_DENIED` |
| **PAYLOAD-11** | Unpublished Leakage | Unauthenticated visitor attempts listing unpublished/draft profiles | `PERMISSION_DENIED` |
| **PAYLOAD-12** | Admin Escalation | Non-admin user attempts writing to `/admins/attackerUid` | `PERMISSION_DENIED` |

---

## 3. Test Runner Specification (`firestore.rules.test.ts`)

The rules suite asserts that:
- Operations satisfying all invariants (signed-in verified admin, compliant payload, server timestamps) succeed (`ALLOW`).
- All 12 threat scenarios above are strictly rejected with `PERMISSION_DENIED`.
