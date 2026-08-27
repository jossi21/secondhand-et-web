# SecondHand ET — Frontend (Web)

**Vintage Challenge – Round 1 | VinTech PLC**
Next.js web client for the SecondHand ET used-goods marketplace.

> Backend repo: `secondhand-et-api` (NestJS + PostgreSQL). This frontend consumes that API only via a same-origin proxy; it never talks to the database directly.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Folder Structure](#2-folder-structure)
3. [Environment Variables](#3-environment-variables)
4. [Local Setup](#4-local-setup)
5. [API Contract Reference](#5-api-contract-reference)
6. [Auth Handling on the Client](#6-auth-handling-on-the-client)
7. [Key Pages & Components](#7-key-pages--components)
8. [Feature Notes](#8-feature-notes)
9. [Known Gaps / Not Yet Built](#9-known-gaps--not-yet-built)

---

## 1. Tech Stack

| Concern        | Choice                                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Framework      | Next.js 16 (**App Router**, Turbopack)                                                                                                    |
| Language       | TypeScript                                                                                                                                |
| Styling        | Tailwind CSS v4 (`@theme inline` custom tokens — cream/ink/terracotta/sage palette, `Fraunces`/`IBM Plex Mono`/`Inter` fonts)             |
| Data fetching  | Custom `fetch` wrapper (`lib/api.ts`) — no SWR/React Query                                                                                |
| Images         | `next/image`, files served from the backend's local disk at `/uploads/**` (no Cloudinary)                                                 |
| Forms          | Plain React state + hand-written validators in `lib/validation/` — no React Hook Form, no zod                                             |
| Auth transport | Backend issues a JWT; the frontend stores it in an **httpOnly cookie** set by a Next.js Route Handler proxy, not in JS-accessible storage |

---

## 2. Folder Structure

```
src/
├── app/
│   ├── page.tsx                        # Landing page (hero, live stats, categories, recent listings)
│   ├── browse/page.tsx                 # Search + filters
│   ├── login/page.tsx                  # Combined Sign In / Create Account (role-aware)
│   ├── saved/page.tsx                  # Buyer's saved listings
│   ├── buyer/page.tsx                  # Buyer dashboard (saved listings, ratings given)
│   ├── seller/page.tsx                 # Seller dashboard (listings, stats, ID verification, ratings/reports)
│   ├── listings/
│   │   ├── new/page.tsx                # Create listing
│   │   ├── [id]/page.tsx               # Listing detail — save, report, rate seller, reviews
│   │   └── [id]/edit/page.tsx          # Edit own listing
│   ├── admin/
│   │   ├── page.tsx                    # Admin dashboard (live platform stats)
│   │   ├── listings/page.tsx           # Admin listings CRUD (search/filter/status/delete)
│   │   ├── buyers/page.tsx, buyers/[id]/page.tsx
│   │   ├── sellers/page.tsx, sellers/[id]/page.tsx   # incl. national ID review/approve
│   │   ├── categories/page.tsx
│   │   ├── reports/page.tsx, reports/[id]/page.tsx   # flagged-listing moderation
│   │   ├── reviews/page.tsx            # ratings moderation
│   │   └── layout.tsx                  # AdminLayout (sidebar nav, role-gated)
│   └── api/
│       ├── [...path]/route.ts          # generic proxy → backend for most requests
│       ├── auth/{login,register,logout}/route.ts
│       └── users/{route.ts, [id]/route.ts, [id]/restore/route.ts}
│
├── components/
│   ├── layout/{Navbar,Footer}.tsx
│   ├── auth/RequireRole.tsx            # client-side role guard, redirects if unauthorized
│   ├── browse/{BrowseSidebar,ListingCard}.tsx
│   ├── listings/
│   │   ├── ListingCard.tsx
│   │   ├── ImageUploadGrid.tsx         # multi-image upload w/ drag/drop, paste, previews
│   │   ├── SellerContactLink.tsx       # renders phone/telegram/whatsapp deep links
│   │   ├── ReportListingModal.tsx
│   │   ├── RateSellerModal.tsx
│   │   └── SellerReviews.tsx
│   ├── categories/CategoryCard.tsx
│   ├── users/ContactsEditor.tsx        # seller contact-method picker (max 5, phone/telegram/whatsapp)
│   ├── seller/VerifyIdentityCard.tsx   # national ID submission
│   ├── dashboard/DashboardViewToggle.tsx
│   ├── admin/                          # CreateUserCard, EditUserCard, EditListingCard,
│   │                                   # UserManagementTable, UserDetailView, AdminListingsTable,
│   │                                   # ReportsTable, CategoryManager, IconPicker, etc.
│   └── ui/                             # Dropdown, DeleteDialog, Popup, FormModal, FormField,
│                                        # Toast (ToastProvider), Table, ActionButtons
│
├── lib/
│   ├── api.ts                          # apiFetch()/ApiError — calls same-origin /api/* proxy
│   ├── api-server.ts                   # server-side fetch helper for Server Components
│   ├── api/                            # listings.ts, categories.ts, uploads.ts, ratings.ts,
│   │                                   # reports.ts, savedListings.ts, nationalId.ts
│   ├── auth/{AuthContext.tsx,session.ts}
│   ├── media.ts                        # resolveMediaUrl() — backend origin + /uploads path
│   ├── validation/{userForm,listingForm,categoryForm}.ts
│   ├── contactChannels.ts, categoryIcons.ts, conditionLabels.ts, conditionOptions.ts, reportReasons.ts
│   └── types.ts                        # shared TS types mirroring backend response DTOs
│
└── hooks/
    ├── useCategories.ts, useListings.ts, useAdminUsers.ts, useCreateUser.ts
```

---

## 3. Environment Variables

`.env.local`

```bash
NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:4000
NEXT_PUBLIC_MAX_UPLOAD_IMAGES=8
NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE_MB=20
```

> Env changes require a full dev-server restart — Next.js doesn't hot-reload `.env.local`.

---

## 4. Local Setup

```bash
git clone <repo-url> secondhand-et-web
cd secondhand-et-web
npm install
cp .env.local.example .env.local     # point NEXT_PUBLIC_BACKEND_ORIGIN at your local backend
npm run dev                          # http://localhost:3000
```

Requires the backend (`secondhand-et-api`) running locally — including its own Postgres container (`docker-compose up -d` in that repo) and the API server itself (`npm run start:dev`, default port `4000`).

---

## 5. API Contract Reference

All backend routes are proxied through this app's own `/api/*` Route Handlers so the JWT cookie can stay httpOnly. Full request/response shapes live in the backend repo; quick index of what's wired up:

| Frontend feature                              | Backend endpoint(s)                                                                    |
| --------------------------------------------- | -------------------------------------------------------------------------------------- |
| Register (buyer/seller)                       | `POST /auth/register`                                                                  |
| Admin creates a seller                        | `POST /auth/register` (admin-authenticated)                                            |
| Login (role required — blank = admin attempt) | `POST /auth/login`                                                                     |
| Current session                               | `GET /auth/me`                                                                         |
| Browse / search listings                      | `GET /listings?q=&categoryId=&city=&minPrice=&maxPrice=&status=&page=&limit=`          |
| Listing detail                                | `GET /listings/:id`                                                                    |
| Create / edit / delete listing                | `POST /listings`, `PATCH /listings/:id`, `DELETE /listings/:id`                        |
| Image upload                                  | `POST /uploads/image` (multipart)                                                      |
| Save / unsave a listing                       | `PUT /saved-listings/:listingId` (idempotent toggle)                                   |
| My saved listings                             | `GET /saved-listings`                                                                  |
| Report a listing                              | `POST /reports`                                                                        |
| Admin: list / view / dismiss reports          | `GET /reports`, `GET /reports/:id`, `DELETE /reports/:id`                              |
| Rate a seller                                 | `POST /ratings`, `PATCH /ratings/:id`, `DELETE /ratings/:id`                           |
| Seller's ratings summary                      | `GET /ratings/seller/:sellerId`                                                        |
| Admin: all ratings                            | `GET /ratings`                                                                         |
| National ID submission (self)                 | `PATCH /users/me/national-id`                                                          |
| Admin: approve verification                   | `PATCH /users/:id` `{ isVerified: true }`                                              |
| Admin: list / update / archive users          | `GET /users?role=`, `PATCH /users/:id`, `DELETE /users/:id`, `POST /users/:id/restore` |
| Categories                                    | `GET /categories`, admin CRUD under `/categories`                                      |
| Seller dashboard                              | `GET /dashboard/seller`                                                                |
| Buyer dashboard                               | `GET /dashboard/buyer`                                                                 |
| Public landing-page stats                     | `GET /dashboard/public-stats`                                                          |

All error responses follow: `{ statusCode, message, error }` — `message` (string or string[]) is surfaced directly in toasts/inline form errors via `ApiError`.

---

## 6. Auth Handling on the Client

- Login/register hit this app's own `/api/auth/*` Route Handlers, which forward to the backend and set an **httpOnly, `sameSite=lax`, 15-minute cookie** (`shet_token`) — the JWT is never exposed to client JS.
- `AuthContext` (`lib/auth/AuthContext.tsx`) holds the current `UserInfo` in React state, fetched once via `GET /auth/me` on mount, and exposes `login`, `register`, `logout`, and `refreshUser()` (used after self-service updates like national ID submission).
- **Role selection at login is required, not optional**: selecting Buyer/Seller checks against the account's actual role; leaving both unselected sends `role: "admin"` implicitly, so a non-admin account is rejected rather than silently logging in.
- Route protection: `<RequireRole roles={[...]}>` wraps dashboard/admin pages, redirecting unauthenticated users to `/login` and mismatched roles to `/`.

---

## 7. Key Pages & Components

- **`app/page.tsx`** — hero, a **live stats bar** (`GET /dashboard/public-stats` — active listings, verified sellers, cities covered, completed sales), category grid, recent listings — all server-fetched, no client loading spinners on first paint.
- **`browse/page.tsx`** — `BrowseSidebar` filters + listing grid, URL-shareable via query params.
- **`listings/[id]/page.tsx`** — image gallery, seller contact links (phone/telegram/whatsapp), save toggle, report-listing modal, rate-seller modal + reviews list, similar listings.
- **`listings/new/page.tsx`** / **`listings/[id]/edit/page.tsx`** — `ImageUploadGrid` (drag/drop, clipboard paste, up to 8 images, broad format support incl. AVIF/HEIC where the browser can render them).
- **`login/page.tsx`** — single page, tabbed Sign In / Create Account. Registration branches by role: **buyers** provide a single phone number; **sellers** pick from a contact-method list (phone/telegram/whatsapp, up to 5) via `ContactsEditor` — never both fields on the same account.
- **`seller/page.tsx`** — listings table with per-row status actions (mark sold/removed/restore), stats, `VerifyIdentityCard` (hidden once verified), recent ratings/reports.
- **`admin/*`** — full back-office: user management (buyers/sellers, with contact/national-ID review for sellers), listings CRUD with search + status/category/city/price filters, report moderation (dismiss or remove the listing), ratings moderation, category management with icon picker.

---

## 8. Feature Notes

- **Contacts system**: sellers don't have a plain `phone` column filled in directly — their public contact methods live in a `contacts: {type, value}[]` array (`phone | telegram | whatsapp`, max 5). If one entry is type `phone`, that value also backs the account's phone field for uniqueness checks.
- **Save/unsave** uses a single idempotent `PUT` toggle endpoint (not separate POST/DELETE) specifically to avoid race conditions from rapid save→unsave clicks.
- **Reports**: buyers pick from preset reasons (Spam/Misleading, Prohibited item, Scam, Inappropriate, Other-with-detail); no limit on reports per user per listing. Admin can **Dismiss** (clears the report, listing stays live) or **Remove Listing** independently.
- **Ratings**: one rating per buyer per seller (enforced by a DB unique constraint), editable/deletable by the author or an admin.
- **National ID verification**: seller self-submits an ID number + photo (`PATCH /users/me/national-id`), which resets `isVerified` to `false` until an admin reviews and approves it from the seller's detail page.

---

## 9. Known Gaps / Not Yet Built

- **Payments**: no payment gateway integrated yet (Chapa was evaluated but not wired in — this is a direct-contact marketplace, not an escrow/checkout flow, so integration would be for optional paid features like promoted listings rather than transactions themselves).
- **Refresh-token rotation**: the JWT cookie is short-lived (15 min) with no silent-refresh flow yet — session simply expires and the user is redirected to log in again.
- **Automated tests**: no e2e/integration test suite yet; testing has been manual, click-through verification per feature.
