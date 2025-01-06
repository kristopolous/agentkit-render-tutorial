# Hacker News Agent with Render and Inngest

<p align="center">

![Hacker News Agent](./preview.png)

</p>

<p align="center">
    <a href="https://www.render.com/docs/">Render docs</a>
    <span>&nbsp;·&nbsp;</span>
    <a href="https://agentkit.inngest.com/overview?ref=render-hacker-news-agent-repository">Inngest Agent Kit docs</a>
</p>
<br/>

Learn how to build and deploy a Hacker News agent with Inngest, Render, and Next.js.

## What the agent does
This Hacker News Agent periodically generates a summary of popular articles on Hacker News, and emails you a report.

To use it, you:
- Specify _questions_ you want answered about specific _topics_.

    For example, you can specify "Next.js" as a topic, and ask "What are the latest open source libraries?"
- Specify the _frequency_ at which you want summaries for each question. (E.g. every hour, once a day, once a week)

The Agent will do the rest.

![Hacker News Agent](./nextjs-app-preview.png)

## Table of contents
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Deploy this project on Render](#deploy-this-project-on-render)
- [Modify or run the project locally](#modify-or-run-the-project-locally)

## Project structure

- `packages/indexer`: A cron job that indexes Hacker News content into a vector database.

    This job is deployed using a [Render Cron Job](https://render.com/docs/cronjobs), and the vector database is a Render PostgreSQL database that has the [`pgvector` extension enabled](https://render.com/docs/postgresql-extensions).
- `packages/app`: A web app that includes the UI to configure topics and questions for the Hacker News agent, and the backend logic for the agents.

   This app is written in Next.js and hosted as a [web service](https://render.com/docs/web-services) on Render. The app uses [Inngest's AgentKit](https://agentkit.inngest.com/overview) to create and orchestrate agents. To use Inngest's terminology, we'll refer to the combination of routing logic, agents, and tools as the _AgentKit Network_.

## Prerequisites
### Accounts
To run this project, you need the following accounts:

- [Render account](https://render.com/?utm_source=inngest-hn-agent-repo): host and scale web applications
- [Inngest account](https://inngest.com/?ref=render-hacker-news-agent-repository): workflow and agent orchestration
- [OpenAI account](https://platform.openai.com/): API for LLM
- [Resend account](https://resend.com/): API to send email

### Github code
Before you get started, git clone this repo to your local machine.

## Deploy this project on Render

### 1. Set up the PostgreSQL vector database

#### What it's for
The PostgreSQL database is used to store Hacker News stories. It serves as the vector database for the AgentKit Network.

#### Steps
To set up this database, we'll create a new PostgreSQL database on Render, enable the `pgvector` extension on the database, and initialize it with our project's schema.

Follow these steps:

1. [Create a Project on Render](https://render.com/docs/projects#setup). Name it "Hacker News Agent".

2. [Create a new PostgreSQL database on Render](https://render.com/docs/postgresql-creating-connecting#create-your-database).

    - For the "Project", specify the project you created in Step 1.
    - For the "Instance Type", you may use the Free plan.

3. Enable the pgvector extension and initialize the database with the project's schema.

    - 3.1. Locate the `schema.sql` file in this repo. (This file contains the commands to enable the pgvector extension and set up this project's schema.)
    - 3.2. Copy your database's [external database URL](https://render.com/docs/postgresql-creating-connecting#external-connections) from the Render dashboard.
    - 3.3. Run the following command in your terminal from the root of the project, but replace the dummy PostgreSQL URL with your URL from Step 3.2:

      ```bash
      psql -Atx postgresql://<redacted>@<redacted>.render.com/<redacted> -f packages/indexer/schema.sql
      ```

### 2. Set up the Indexer cron job

#### What it's for
The Indexer service fetches Hacker News stories and stores them in the PostgreSQL vector database.

#### Steps

We will set up the Indexer service as a cron job on Render. (Render offers a Cron Job service type.)

This cron job is packaged as a Docker image that is configured with Playwright and its Chromium binary. For your convenience, we've made this Docker image publicly available on Docker Hub. The image name is `docker.io/wittydeveloper/inngest-render-indexer:0.4`.

1. Create a new cron job on Render [using these instructions](https://render.com/docs/cronjobs#setup).
    - Use the "Existing image" option and provide the following "Image URL": `docker.io/wittydeveloper/inngest-render-indexer:0.4`.
    - Configure the _Schedule_ to run on a daily basis: `0 0 * * *`.
    - Configure the following environment variables:
       - `DATABASE_URL`: The internal URL of your PostgreSQL database ([here's how to find it](https://render.com/docs/postgresql-creating-connecting#internal-connections)).
       - `OPENAI_API_KEY`: Your OpenAI API key.
2. (optional) To see a sample run, [manually trigger a run](https://render.com/docs/cronjobs#manually-triggering-a-run) of your cron job. Note that the cron job will not fetch any stories from Hacker News yet. You'll need to set up the Next.js app (next step), and specify some "interests" to track via the app's UI.

#### About the code
The Docker image is built from the `Dockerfile` at the root of this project.

See the `packages/indexer` directory for the source code.

### 3. Set up the Next.js app and AgentKit Network

#### What it's for
The Next.js app and AgentKit Network is used to serve as the frontend to configure the Hacker News agent and as backend to run the AgentKit Network.

#### Steps

The `packages/app` directory contains a Next.js application that will serve as the frontend for the Hacker News agent.

To set up the Next.js app and AgentKit Network, you need to create a new Web Service on Render and configure it to run the Next.js application.

1. [Create a new Web Service on Render](https://render.com/docs/web-services#deploy-from-github--gitlab--bitbucket) using the "Public Github repository" option by pasting the repository URL `https://github.com/wittydeveloper/inngest-render-hacker-news-agent` in the "Repository URL" field.
2. Configure the _Root Directory_ to `packages/app/`.
3. Configure the _Build Command_ to `pnpm install; pnpm build`.
4. Configure the following environment variables:

   - `DATABASE_URL`: The URL of your PostgreSQL vector database ([from the Connect button on the PostgreSQL database dashboard](https://render.com/docs/postgresql-creating-connecting#external-connections)).
   - `INNGEST_EVENT_KEY`: The [Event Key of your Inngest project](https://www.inngest.com/docs/events/creating-an-event-key?ref=render-hacker-news-agent-repository).
   - `INNGEST_SIGNING_KEY`: The [Signing Key of your Inngest project](https://www.inngest.com/docs/platform/signing-keys?ref=render-hacker-news-agent-repository).
   - `OPENAI_API_KEY`: Your OpenAI API Key.
   - `RESEND_API_KEY`: Your Resend API Key.
   - `APP_PASSWORD`: The password to access the app.

You are good to go!

### 4. Try it out!

To try it out, go to your Render Web Service dashboard and copy the URL of your web service (ex: https://agenkit-render-tutorial.onrender.com).

The following page should be displayed:

![Hacker News Agent](./nextjs-app-preview.png)

## Modify or run the project locally

Install dependencies by running the following command from the root of the project:

```bash
pnpm install
```

### Indexer (`packages/indexer`)

**Run the indexer locally**

> Note: You'll need to set up the `.env.local` file.

```bash
pnpm build

pnpm start
```

**Push a new Docker image version**

Example:

```bash
docker build -t docker.io/wittydeveloper/inngest-render-indexer:0.5 .
docker push docker.io/wittydeveloper/inngest-render-indexer:0.5
```

### Next.js app (`packages/app`)

> Note: You'll need to set up the `.env.local` file.
> Don't forget to set the `APP_PASSWORD` password

**Run the Next.js app locally**

```bash
pnpm dev
```

**Start the Inngest Dev Server**

```bash
npx inngest-cli@latest dev
```
