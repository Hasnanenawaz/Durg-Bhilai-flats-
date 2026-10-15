# Durg Bhilai Flats & Flatmates

Zero-brokerage rental website for Durg, Bhilai and the rest of Chhattisgarh.
Owners list flats, PGs, rooms and "flatmate wanted" posts for free. Guests log in with a phone OTP and call owners directly.

Built with **Next.js 15 (App Router)**, **Supabase** (database + photo storage) and **Firebase Phone Auth** (OTP SMS).

---

## What's inside

| Area | Features |
|---|---|
| **Accounts** | Phone OTP login (Firebase). One account for both sides, with a **Guest / Host switch** in the header. Name + city on first login. |
| **Guest** | Search by city, area, landmark, type, rent range, tenant type, size, furnishing. Listing page with facts, amenities, photos, map link. “Show owner’s number” (login required) → Call / WhatsApp with a pre-filled message. Save places. Report fake listings. History of owners contacted. |
| **Host** | Add/edit listings: type, size, rent, deposit, maintenance, food, availability, city, locality, landmark, PIN, private address, GPS pin, up to 10 photos (auto-shrunk in the browser, reorder, set cover), amenities, contact details. Dashboard with views and inquiry counts. Mark rented / pause / relist / delete. **Inquiries tab** shows every guest who asked, with their number. |
| **Admin** (`/admin`) | **Every signed-up phone number** with Call/WhatsApp buttons, lead status (new → called → interested → converted), call notes, block user, **CSV export**. Listing moderation (approve / reject / hide / featured / verified owner). All inquiries. Reports. |
| **Blog** | Admin editor (Markdown with live preview, FAQ builder, SEO title/description with character counts, cover image, tags, city, draft/publish). Public `/blog` with tag filters and post pages with table of contents. |
| **SEO / AEO / GEO** | City pages (`/rent/bhilai`), city + type pages (`/rent/durg/pg`), landmark pages (`/near/iit-bhilai`) for 10 Chhattisgarh cities and 11 colleges/workplaces. Answer-first summary boxes with **live rent numbers** from real listings. JSON-LD: Organization, WebSite + SearchAction, Offer/Apartment for listings, CollectionPage, BreadcrumbList, FAQPage, BlogPosting. Dynamic sitemap, robots.txt that welcomes AI crawlers, `/llms.txt`, Open Graph image, `en-IN` + Chhattisgarh geo tags, canonical URLs, filtered pages set to noindex. |

---

## Run it on your computer (no setup needed)

```bash
npm install
cp .env.example .env.local      # then set ADMIN_PHONES to your own number
npm run seed -- --demo          # 2 starter blog posts + sample listings (for testing only)
npm run dev                     # http://localhost:3000
```

Without Supabase and Firebase keys the site runs in **local mode**: data is saved to `.data/db.json`, and the OTP is shown on screen instead of being sent by SMS. Log in with the number you put in `ADMIN_PHONES` to open `/admin`.

---

## Going live

### 1. Supabase (database + photos)
1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → paste everything from `supabase/schema.sql` → **Run**. This creates all tables and the public `property-images` storage bucket.
3. **Project Settings → API**: copy the **Project URL** and the **service_role** key into `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
   The service key is only used on the server. Never put it in a `NEXT_PUBLIC_` variable.
4. `npm run seed` to add the two starter blog posts (skip `--demo` for the live site).

### 2. Firebase (OTP SMS)
1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) → **Build → Authentication → Get started → Sign-in method → Phone → Enable**.
2. **Authentication → Settings → Authorized domains**: add your domain (e.g. `durgbhilaiflats.in`) and your Vercel URL.
3. **Project settings → Your apps → Web app (</>)**: copy `apiKey`, `authDomain`, `projectId`, `appId` into the four `NEXT_PUBLIC_FIREBASE_*` variables.
4. Phone auth needs the **Blaze (pay-as-you-go)** plan for real SMS. For testing you can add test numbers + codes under **Phone → Phone numbers for testing**.

No Firebase secret is needed on the server: the site checks the login token against Google's public keys.

### 3. Deploy on Vercel
1. Push this folder to GitHub and import it in Vercel.
2. Add every variable from `.env.example` in **Settings → Environment Variables**. Set:
   - `NEXT_PUBLIC_SITE_URL` to your real domain (used for canonical URLs, sitemap and schema)
   - `SESSION_SECRET` to a long random string (`openssl rand -base64 48`)
   - `ADMIN_PHONES` to your 10-digit number(s), comma separated
   - `ALLOW_DEV_OTP=false`
3. Deploy, then submit `https://yourdomain/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

---

## Day-to-day

- **New listings** wait in **Admin → Listings → Pending** until you approve them (set `LISTING_AUTO_APPROVE=true` to skip review).
- **Calling users**: Admin → Users. Change the lead status as you go, add notes, or export everything to CSV.
- **Writing guides**: Admin → Blog → New post. Open with a 2–3 sentence direct answer, use question-style `##` headings, add 2–4 FAQs. That format is what Google answer boxes and AI assistants quote.
- **Adding a city, locality or college**: edit `lib/locations.js`. New pages, sitemap entries and filters appear automatically.

## Project map

```
app/                    pages and API routes
  rent/[city]/[type]    city + type landing pages (SEO)
  near/[landmark]       college / workplace pages (SEO)
  property/[slug]       listing page
  host/                 host dashboard, editor, inquiries
  account/              guest profile, history, saved
  admin/                admin panel
  api/                  auth, listings, uploads, admin
components/             UI pieces
lib/
  db.js                 Supabase ⇄ local JSON data layer + photo storage
  auth.js, session.js   login sessions (signed cookie, 30 days)
  otp.js                Firebase token check + dev OTP
  models.js             listing rules, search, rent stats
  locations.js          Chhattisgarh cities, localities, landmarks
supabase/schema.sql     database setup
scripts/seed.mjs        starter content
tests/smoke.mjs         end-to-end test (71 checks)
```

## Testing

```bash
npm run build
ALLOW_DEV_OTP=true ADMIN_PHONES=9876543210 npm start
node tests/smoke.mjs
```

Before launch, have the Privacy Policy and Terms pages reviewed by a lawyer, and remove any demo listings.
