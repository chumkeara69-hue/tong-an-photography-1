# Tong An Photography — Production Deployment Package

## What has been prepared

This package is prepared for production deployment with:

- Prisma PostgreSQL schema and migrations
- Supabase/PostgreSQL production environment template
- AWS S3 private storage configuration
- S3 server-side encryption (`AES256`) enabled by default
- Production migration command: `npm run db:deploy`
- Production seed command: `npm run db:seed:prod`
- Existing admin/order/photo/download workflow preserved

## IMPORTANT: why there is no real DATABASE_URL in this ZIP

A real online database connection requires a database project that belongs to you (for example, a Supabase project) and its private credentials. Those credentials cannot be safely invented or embedded into a downloadable package.

Therefore `.env.production.example` contains explicit `CHANGE_ME_*` placeholders. After you create your Supabase project, replace them with the real values in your hosting provider's environment variables.

## 1. Supabase Database

1. Create a Supabase project.
2. Open the project's database connection settings.
3. Copy the PostgreSQL connection string.
4. Set `DATABASE_URL` in Vercel/your hosting provider.
5. Run:

```bash
npm install
npx prisma generate
npm run db:deploy
npm run db:seed:prod
```

`db:deploy` applies the migration already included in `prisma/migrations`.

## 2. AWS S3 Storage

Create a private S3 bucket.

Recommended:
- Region: `ap-southeast-1`
- Block all public access: ON
- Default encryption: SSE-S3 / AES256
- Versioning: recommended
- Bucket name: your own unique name

Use an IAM identity with access only to this bucket/prefixes.

Required application permissions:
- `s3:PutObject`
- `s3:GetObject`

The application uses presigned upload/download URLs. Originals and payment proofs should remain private.

Suggested object layout:

```text
previews/
originals/
payment-proofs/
```

Configure S3 CORS for your real website domain, not `*`.

## 3. Vercel / Website

Import the GitHub repository into Vercel.

Build command:

```bash
npm run build
```

Start command:

```bash
npm start
```

Add all variables from `.env.production.example` to Vercel → Settings → Environment Variables.

Do not upload `.env.production.example` as a secret file and do not commit any real `.env` file.

## 4. Production admin

Set:

```text
ADMIN_EMAIL=your-real-admin-email
ADMIN_PASSWORD=a-long-unique-password
```

Do not use the development default `ChangeMe123!`.

Generate an authentication secret with:

```bash
openssl rand -base64 32
```

## 5. Domain

After the Vercel deployment is working:

1. Attach your real domain to Vercel.
2. Set `APP_URL=https://your-real-domain`.
3. Update S3 CORS `AllowedOrigins` to that exact HTTPS origin.
4. Redeploy.

## 6. Production smoke test

Test all of these before accepting real customers:

- Homepage and gallery load
- Admin login
- Category/photo creation
- Preview upload
- Original upload
- Checkout/order creation
- Payment proof upload
- Admin proof viewing
- Admin payment approval
- Download link generation
- Original download
- Expired/unauthorized download is rejected
- S3 bucket remains private
- No AWS or database secret appears in GitHub

## Current payment model

The project is configured for manual KHQR/ABA verification:

Customer pays → uploads receipt → admin verifies → admin approves → customer downloads.

Automatic bank/payment verification is not included unless the relevant official merchant API/webhook is integrated.

## Security note

Never send your Supabase database password, AWS secret key, admin password, or authentication secret in chat or commit them to GitHub.
