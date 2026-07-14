# DZ Print — POD E-commerce Starter

Mobile-first print-on-demand storefront for the Algerian market. Next.js 14
(App Router) + Tailwind + shadcn/ui components + Supabase (DB, auth-ready,
storage) + Resend for order-notification emails + react-konva for the
live design customizer.

## Stack

| Concern            | Choice                                           |
|---------------------|---------------------------------------------------|
| Framework           | Next.js 14 (App Router, RSC + Route Handlers)     |
| Styling             | Tailwind CSS + shadcn/ui (Radix primitives)       |
| Data                | Supabase Postgres (`products`, `orders`, `shipping_data`) |
| File storage        | Supabase Storage (`custom-designs` bucket)        |
| Canvas customizer   | react-konva + `use-image`                          |
| Email notifications | Resend, sent from `app/api/orders/route.ts`       |
| Validation          | Zod, shared between client form and API route     |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Resend keys
```

1. Create a Supabase project, then run `supabase/schema.sql` in the SQL
   editor (creates tables, RLS policies, and the `custom-designs` storage
   bucket). Optionally run `supabase/seed.sql` for sample products.
2. Get a [Resend](https://resend.com) API key and verify a sending domain,
   or use their sandbox `onboarding@resend.dev` sender while testing.
3. Add real garment mockups (transparent PNG, front view) to
   `public/mockups/` — the customizer expects
   `public/mockups/tshirt-white-front.png` by default (see
   `app/customizer/page.tsx`).
4. `npm run dev` and open http://localhost:3000.

## Architecture notes

- **Catalog** (`app/page.tsx`) is a Server Component that reads `products`
  directly from Supabase with `revalidate = 60` (ISR) — no client-side
  fetch waterfall, good for mobile data connections.
- **Address selector** (`components/AddressSelector.tsx`) is a pure
  client-side cascade over `data/locations.json` — no network round-trip
  when the Wilaya changes, so the Commune list updates instantly. Selecting
  a new Wilaya always clears the Commune field to prevent submitting a
  mismatched pair.
- **Checkout** (`components/CheckoutForm.tsx`) validates with the same Zod
  schema as the API route, then POSTs to `/api/orders`.
- **Orders API** (`app/api/orders/route.ts`) re-validates server-side,
  inserts with the Supabase **service-role** client (RLS blocks the
  public anon key from reading/writing orders directly — protects
  customer PII), and fires an admin email via Resend. The email send is
  wrapped so a Resend outage never blocks order confirmation.
- **Customizer** (`components/Customizer.tsx`) renders the garment mockup
  and the uploaded design as two Konva layers on one `<Stage>`. Konva is
  dynamically imported with `ssr: false` since it touches the DOM
  directly. Dragging/scaling/rotating is handled by Konva's own
  `Transformer` (GPU-accelerated `<canvas>`, not React re-renders per
  frame) — this keeps it performant even on mid-range phones.

## Data completeness — `data/locations.json`

This ships with **all 58 wilayas** and a representative set of communes
per wilaya (chef-lieu + main daïra towns — 411 communes total) so the
cascading dropdown, the schema, and the test suite all work end-to-end
out of the box. Algeria officially has ~1,541 communes; to reach full
coverage, replace the `communes` array per wilaya with the complete ONS
(Office National des Statistiques) list — the `{code, name}` shape is
unchanged, so no component code needs to change.

## Testing

```bash
npm test
```

`tests/checkout-address.test.tsx` verifies:
- `locations.json` has 58 unique wilaya codes and every commune code is
  correctly scoped to its parent wilaya.
- Selecting **Tizi Ouzou** in the Wilaya dropdown shows *only* Tizi Ouzou's
  communes in the Commune dropdown (and none from other wilayas).
- Changing the Wilaya resets any previously selected Commune.

## Suggested next steps

- Wire a persistent cart (Zustand store or a Supabase `cart_items` table)
  instead of the single-item `sessionStorage` handoff used between
  `/customizer` and `/checkout`.
- Add Supabase Auth (magic link or phone OTP) for order history / repeat
  customers — `lib/supabase/server.ts` and `client.ts` are already set up
  for it.
- Add per-wilaya shipping fee lookups from `shipping_data` instead of the
  flat fee used in `CheckoutForm`.
