# Architecture

The first release is a modular NestJS monolith with a single PostgreSQL source of truth. Redis provides cache, rate limiting, queues and ephemeral state; S3-compatible storage owns media. This minimizes distributed transaction and operational risk while preserving boundaries that can later be extracted.

## Applications

- `web`: Next.js App Router public site with SSR/ISR and indexed listing pages.
- `admin`: independent Next.js RBAC-protected operations console.
- `mobile`: one Expo Router codebase for Android and iOS.
- `api`: versioned REST API; WebSocket gateways and workers live in their owning domains.

## Domain model

| Domain | Modules |
| --- | --- |
| Identity | auth, sessions, MFA, RBAC |
| People | users, profiles, verification, privacy |
| Marketplace | catalog, attributes, listings, media, discovery, geo |
| Communication | conversations, messages, notifications |
| Trust | reports, reviews, moderation, prohibited content |
| Business | organizations, plans, promotions, payments, balance |
| Operations | support, settings, content, banners, audit, analytics |

Domains call typed application interfaces and publish domain events; they never import another domain's persistence layer. Prisma migrations belong only to the API. Shared packages contain contracts, UI, validation, localization and API-client primitives, never server secrets.

Security starts with short-lived access tokens, rotated refresh families, Argon2 hashes, authorization at every protected handler, upload validation, rate limits, least-privilege storage policies and immutable privileged-action audits.
