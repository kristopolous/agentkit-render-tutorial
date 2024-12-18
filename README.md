# Hacker News Agent

A monorepo containing a Next.js application with an Inngest-powered Hacker News agent.

## Project Structure

- `packages/app`: Next.js application with the Hacker News agent UI
- `packages/indexer`: TypeScript library for searching and indexing Hacker News content

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Start development servers:

```bash
pnpm dev
```

This will start both the Next.js application and the indexer in watch mode.

## Building

To build all packages:

```bash
pnpm build
```

## Environment Variables

Copy `.env.example` to `.env.local` in the `packages/app` directory and fill in the required variables.

<!-- psql -Atx postgresql://hacker_news_agent_vector_database_user:n8nFyxdyzWyBq2wy6t4jwhS53R2jgpcO@dpg-ctgl8vaj1k6c73a31e5g-a.oregon-postgres.render.com/hacker_news_agent_vector_database -f packages/indexer/schema.sql  -->
