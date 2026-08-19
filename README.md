# SecondHand ET — Frontend (Web)

**Vintage Challenge – Round 1 | VinTech PLC**
Next.js web client for the SecondHand ET used-goods marketplace.

> Backend repo: `secondhand-et-api` — see that repo's README for the full API documentation (all endpoints, request/response shapes, auth flow). This frontend consumes that API only; it never talks to the database directly.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Folder Structure](#2-folder-structure)
3. [Environment Variables](#3-environment-variables)
4. [Local Setup](#4-local-setup)
5. [API Contract Reference](#5-api-contract-reference)
6. [Auth Handling on the Client](#6-auth-handling-on-the-client)
7. [Key Pages & Components](#7-key-pages--components)
8. [Git Workflow](#8-git-workflow)
9. [Milestones](#9-milestones)
10. [UX Checklist](#10-ux-checklist)

---

## 1. Tech Stack

| Concern       | Choice                                                                    |
| ------------- | ------------------------------------------------------------------------- |
| Framework     | Next.js (Pages Router)                                                    |
| Language      | TypeScript                                                                |
| Styling       | Tailwind CSS                                                              |
| Data fetching | `fetch` wrapper (`lib/api.ts`) + SWR for client-side caching/revalidation |
| Images        | `next/image`, uploaded files served from Cloudinary                       |
| Forms         | React Hook Form + zod for validation (mirrors backend DTO rules)          |
| Deployment    | Vercel                                                                    |

---

## 2. Folder Structure

```
src/
├── pages/
│   ├── index.tsx                 # Landing page (hero, categories, featured listings)
│   ├── search.tsx                # Browse + filters (q, category, price, condition, city)
│   ├── listings/
│   │   ├── [id].tsx              # Listing detail + contact seller
│   │   └── new.tsx               # Create listing form
│   ├── seller/
│   │   └── [id].tsx              # Public seller profile + ratings
│   ├── account/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── my-listings.tsx       # Logged-in user's own listings (edit/delete/mark sold)
│   └── _app.tsx
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── listings/
│   │   ├── ListingCard.tsx       # ported/restyled from the earlier Amazon-clone product card
│   │   ├── ListingGrid.tsx
│   │   ├── FilterSidebar.tsx
│   │   ├── ConditionBadge.tsx
│   │   └── PhotoUploader.tsx
│   ├── seller/
│   │   ├── SellerCard.tsx
│   │   └── RatingStars.tsx
│   ├── contact/
│   │   └── ContactSellerButton.tsx   # tel: and Telegram deep links
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── EmptyState.tsx
│
├── lib/
│   ├── api.ts                    # typed fetch wrapper, attaches JWT, handles refresh
│   ├── auth.ts                   # token storage helpers
│   └── types.ts                  # shared TS types mirroring backend DTOs
│
├── hooks/
│   ├── useAuth.ts
│   └── useListings.ts            # SWR hook wrapping GET /listings
│
└── styles/
    └── globals.css
```

---

## 3. Environment Variables

`.env.local.example`

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

---

## 4. Local Setup

```bash
git clone https://github.com/<org>/secondhand-et-web.git
cd secondhand-et-web
npm install
cp .env.local.example .env.local     # point NEXT_PUBLIC_API_URL at your local backend
npm run dev                          # http://localhost:3000
```

> Requires the backend (`secondhand-et-api`) running locally at the URL set above — see that repo's README for its own setup steps.

---

## 5. API Contract Reference

Full endpoint documentation (request/response bodies, query params, error shape) lives in the **backend repo's README**. Quick index of what this frontend calls, so both teams stay aligned — if a route name or field changes, update it in both READMEs the same day:

| Frontend feature          | Backend endpoint                                                              |
| ------------------------- | ----------------------------------------------------------------------------- |
| Register / Login          | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`               |
| Landing/browse categories | `GET /categories`                                                             |
| Search & filter listings  | `GET /listings?q=&category=&minPrice=&maxPrice=&condition=&city=&sort=&page=` |
| Listing detail            | `GET /listings/:id`                                                           |
| Create listing            | `POST /listings` (multipart, incl. photos)                                    |
| Edit / delete own listing | `PATCH /listings/:id`, `DELETE /listings/:id`                                 |
| Flag a listing            | `POST /listings/:id/report`                                                   |
| Seller profile            | `GET /users/:id`                                                              |
| Seller ratings            | `GET /users/:id/ratings`, `POST /users/:id/ratings`                           |
| My profile                | `GET /users/me`, `PATCH /users/me`                                            |

All error responses follow: `{ statusCode, message, error, path, timestamp }` — surface `message` in form/toast errors.

---

## 6. Auth Handling on the Client

- On login/register, store the **access token** in memory (React context/`useAuth`), not `localStorage`, to reduce XSS exposure — refresh token lives in an httpOnly cookie set by the backend, so the client never touches it directly.
- `lib/api.ts` attaches `Authorization: Bearer <accessToken>` to every request and, on a 401, calls `/auth/refresh` once and retries before giving up and redirecting to `/account/login`.
- Route protection: wrap pages like `listings/new.tsx` and `account/my-listings.tsx` with a simple `useAuth()` check that redirects unauthenticated users to login.

---

## 7. Key Pages & Components

- **`index.tsx`** — hero banner, category tiles, featured/recent listings grid. Reuses the layout shell (navbar, grid, card styles) from the earlier Amazon-clone reference, restyled for a marketplace (condition badge + location instead of star ratings).
- **`search.tsx`** — `FilterSidebar` (category, price range, condition, city) + `ListingGrid`, all driven by URL query params so results are shareable/bookmarkable.
- **`listings/[id].tsx`** — photo gallery, description, price, `SellerCard` with rating, `ContactSellerButton` (tel: link + Telegram deep link `https://t.me/<sellerUsername>`), report/flag action.
- **`listings/new.tsx`** — multi-step or single-page form: title/description/price → condition → city/neighborhood → `PhotoUploader` (drag/drop, preview, up to 6 images).
- **`seller/[id].tsx`** — seller info, verification badge if `isVerified`, average rating, their active listings.

---

## 8. Git Workflow

- `main` — deployable, protected.
- `dev` — integration branch.
- Feature branches: `feat/search-filters`, `feat/listing-detail-page`, `fix/photo-upload-preview`.
- Commit convention: `feat(search): add price range slider`, `fix(auth): handle 401 refresh loop`.
- Small PRs into `dev`; merge to `main` at each milestone below.

---

## 9. Milestones

Kept identical in dates/scope to the backend repo's README so both repos move in lockstep.

| Dates     | Frontend focus                                                                                                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aug 11–12 | Repo + Next.js skeleton, Tailwind configured, deployed placeholder live on Vercel, `lib/api.ts` wired to backend health check                                                            |
| Aug 13–15 | Login/register pages wired to real auth endpoints, navbar + landing page layout ported/restyled from the clone reference                                                                 |
| Aug 16–18 | Search page with working filters, listing card + grid connected to real `GET /listings` — **this is what the Aug 18 mentor review demo should show working end-to-end with the backend** |
| Aug 19–21 | Listing detail page, create-listing form + photo upload UI, contact-seller buttons                                                                                                       |
| Aug 22–23 | Seller profile + ratings UI, report/flag UI, responsive/mobile polish, loading & error states everywhere                                                                                 |
| Aug 24    | Final deploy, connect to production backend URL, visual QA pass                                                                                                                          |
| Aug 25    | Full end-to-end dry run with backend team for the demo video                                                                                                                             |
| Aug 26    | Buffer — fix anything broken, submit                                                                                                                                                     |

---

## 10. UX Checklist

- [ ] Tested on an actual mobile viewport (not just resized desktop)
- [ ] Images lazy-loaded / optimized via `next/image`
- [ ] Every form shows clear validation errors (mirroring backend messages)
- [ ] Empty states designed (no search results, no listings yet, no ratings yet)
- [ ] Loading skeletons or spinners on all data-fetching views
- [ ] Contact-seller buttons work correctly on mobile (`tel:` opens dialer, Telegram link opens app/web)
