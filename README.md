# Tong An Photography — V4 Photo Store

A Next.js photo-selling website with manual KHQR/ABA payment verification.

## Included and working flow

- Professional photography gallery
- Photo detail page with price
- Add-to-cart and checkout
- Customer order page with your real QR image at `public/payment-qr.jpg`
- Customer uploads a payment receipt (JPG, PNG, WebP, or PDF; max 10 MB)
- Receipt is stored in private S3 storage
- Admin login and order dashboard
- Admin can open the private receipt with a short-lived signed URL
- Admin clicks **Approve Payment** only after checking the receipt
- Approval creates download records for every purchased photo
- Only PAID orders can access original-photo downloads
- Original download links expire after 7 days and allow up to 5 downloads
- Original photos remain private in S3
- Preview images can be served through `S3_PUBLIC_BASE_URL`

## Payment model

This version intentionally uses **manual receipt verification**:

`Customer pays by QR → uploads receipt → Admin verifies → Admin approves → Original download unlocks`

It does **not** claim that a static QR can automatically confirm a bank transaction. Automatic KHQR/ABA verification requires the merchant's official API/webhook and credentials.

## Your QR

The supplied QR is already installed as:

`public/payment-qr.jpg`

The site configuration points to:

`/payment-qr.jpg`

To replace it later, keep the same filename or update `paymentQrPath` in `src/lib/store-config.ts`.

## Production requirements

You need:

1. Node.js 20+
2. PostgreSQL
3. An S3-compatible bucket
4. AWS credentials with access to that bucket
5. S3 CORS allowing browser `PUT` from your website origin
6. A private bucket for originals and payment proofs
7. A public/CDN path only for preview images

### Recommended S3 permissions

The application needs permission to:

- `PutObject` for `originals/*`, `previews/*`, and `payment-proofs/*`
- `GetObject` for private original downloads and admin receipt viewing

Do not make `originals/*` public.

### Example S3 CORS

Set the bucket CORS to allow your real site origin (replace the origin below):

```json
[
  {
    "AllowedOrigins": ["https://your-domain.com"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## Local setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`.
3. Set real AWS/S3 credentials and `S3_BUCKET`.
4. Run `npm install`.
5. Run `npm run db:generate`.
6. Run `npm run db:migrate`.
7. Run `npm run db:seed`.
8. Run `npm run dev`.
9. Open `http://localhost:3000`.

The repository now includes the initial Prisma migration under `prisma/migrations/00000000000000_init` so the schema contains the fields used by the payment flow, including `accessToken` and `paymentProofStorageKey`.

## Admin

Use the values in `.env`:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Change the default password before production deployment.

## Important deployment checks

Before opening the store to customers, verify:

- The database migration completed successfully.
- Admin login works.
- A test photo can be uploaded.
- Preview images load.
- The QR appears on the order page.
- A test receipt can be uploaded.
- The receipt appears in Admin → Orders.
- Admin can open the receipt.
- Admin approval changes the order to PAID.
- The original download works and the S3 original remains private.
- The download expiry/limit works.

## Automatic payment verification

If you later want the website to verify KHQR/ABA payments automatically, add the official merchant API/webhook and verify transaction/reference data server-side before setting `paymentStatus` to `PAID`. Do not unlock downloads based only on a client-submitted screenshot.
