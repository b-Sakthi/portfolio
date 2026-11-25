This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## CI/CD Pipeline (GitHub Actions + Cloudflare)

The repository uses [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) to validate and deploy the static frontend (`out/`) to **Cloudflare Pages** and the API backend (`/worker`) to **Cloudflare Workers** as independent deployments:

- **Pull requests to `main`:** Runs CI only (`npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, `out/` verification, and `wrangler deploy --dry-run` on `worker/wrangler.toml`).
- **Pushes to `main` / manual dispatch on `main`:** Runs all CI checks, then independently runs `deploy-frontend` (`wrangler pages deploy out`) and `deploy-worker` (`wrangler deploy --config wrangler.toml` inside `worker/`).

### Required GitHub Secrets & Variables

Add these in **GitHub → Repository → Settings → Secrets and variables → Actions**:

- **Secrets (required):**
  - `CLOUDFLARE_API_TOKEN`: Scoped Cloudflare API token.
  - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID.
- **Variables (optional):**
  - `CLOUDFLARE_PAGES_PROJECT`: Cloudflare Pages project name (defaults to `sakthib` if unset).

> Never store `ADMIN_TOKEN`, `SESSION_SECRET`, `TELEGRAM_BOT_TOKEN`, or `TELEGRAM_CHAT_ID` in GitHub Actions `NEXT_PUBLIC_*` variables. Manage those exclusively as Cloudflare Worker secrets (`npx wrangler secret put <NAME>` inside `worker/`).

### Least-Privilege Cloudflare API Token Permissions

Create a custom token in **Cloudflare Dashboard → My Profile → API Tokens → Create Token** with only:

- **Account → Cloudflare Pages → Edit** (for deploying `out/`)
- **Account → Workers Scripts → Edit** (for deploying `sakthi-portfolio-contact-worker`)
- **Account → D1 → Read** (for binding validation during Worker deploy; no database creation or automatic migrations are run)
- **Account → Account Settings → Read** (for Wrangler account verification)

### How to Enable GitHub Actions

1. Push [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) to `main`.
2. In GitHub, open the repository **Actions** tab and enable workflows if prompted.
3. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` under **Settings → Secrets and variables → Actions**.

### How to Trigger a Manual Deployment

1. Open **Actions → Portfolio CI/CD** in GitHub.
2. Click **Run workflow**, select branch `main`, and click **Run workflow**.

### How to Inspect Failed Builds & Deployments

1. Open **Actions → Portfolio CI/CD** and select the failed workflow run.
2. Expand the failing job (`CI (Frontend & Worker Checks)`, `Deploy Frontend (Cloudflare Pages)`, or `Deploy Backend (Cloudflare Worker)`) to inspect step logs.
3. For runtime or Worker binding errors, check **Cloudflare Dashboard → Workers & Pages → `sakthi-portfolio-contact-worker` → Logs**.

### How to Roll Back a Deployment

- **Frontend (Cloudflare Pages):** In **Cloudflare Dashboard → Workers & Pages → your Pages project → Deployments**, open the menu (`...`) on a previous healthy deployment and select **Rollback to this deployment**.
- **Backend (Cloudflare Worker):** In **Cloudflare Dashboard → Workers & Pages → `sakthi-portfolio-contact-worker` → Deployments**, select a previous healthy version and choose **Rollback**, or revert the commit on `main` and let the workflow redeploy.
