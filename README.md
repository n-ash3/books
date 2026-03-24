# Book Smart (Hardcover/Goodreads-style MVP)

Book Smart is a reader platform inspired by Hardcover and Goodreads, with built-in links to buy books from:

- Amazon
- Barnes & Noble
- Target
- Books-A-Million

It supports:

- **Find**: search books by title, author, ISBN, or series
- **Track**: save books into shelves (Want to Read, Currently Reading, Read, Did Not Finish)
- **Connect**: community-oriented section for social discovery patterns
- **Discover**: browse books with ratings and quick-buy links

The app can use the Hardcover GraphQL API when a token is configured, and falls back to curated local data if no token is present.

## Hardcover API references

- Docs: https://docs.hardcover.app/
- Getting started: https://docs.hardcover.app/api/getting-started/
- GraphQL endpoint: `https://api.hardcover.app/v1/graphql`
- API tokens: https://hardcover.app/account/api

## Quick start

Clone and run locally:

```bash
git clone https://github.com/n-ash3/books.git
cd books
npm install
cp .env.example .env
npm run dev
```

Open: http://localhost:5173

## Environment variables

Create a `.env` file (or use GitHub Actions secrets):

```bash
VITE_HARDCOVER_API_TOKEN=your_token_here
VITE_HARDCOVER_GRAPHQL_URL=https://api.hardcover.app/v1/graphql
```

If `VITE_HARDCOVER_API_TOKEN` is not set, the UI still works using local fallback data.

## Deploy to GitHub Pages

This repo includes a workflow at:

`.github/workflows/deploy-pages.yml`

### One-time setup

1. In GitHub repo settings, enable **Pages** and select **GitHub Actions** as source.
2. Add repository secrets (optional but recommended):
   - `VITE_HARDCOVER_API_TOKEN`
   - `VITE_HARDCOVER_GRAPHQL_URL` (optional, defaults to Hardcover endpoint)
3. Push to `main` to trigger deployment.

The Vite `base` path is set automatically in GitHub Actions for project pages.

## Scripts

```bash
npm run dev      # local development server
npm run lint     # lint TypeScript/React files
npm run build    # type-check + production build
npm run preview  # preview production build locally
```
