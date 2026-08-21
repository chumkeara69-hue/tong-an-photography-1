const required = [
  "DATABASE_URL",
  "APP_URL",
  "NEXTAUTH_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "S3_BUCKET",
];

const bad = [];
for (const key of required) {
  const value = process.env[key];
  if (!value || value.startsWith("CHANGE_ME_") || value.includes("YOUR_")) bad.push(key);
}

if (bad.length) {
  console.error("Missing/placeholder production environment variables:");
  for (const key of bad) console.error(`- ${key}`);
  process.exit(1);
}

if (!process.env.APP_URL.startsWith("https://")) {
  console.error("APP_URL must use https:// in production.");
  process.exit(1);
}

console.log("Production environment variables look configured.");
