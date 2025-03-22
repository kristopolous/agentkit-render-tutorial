# Sendai Documentation Agent with Render and Apify

<p align="center">

![Sendai Documentation Agent](./images/architecture.png)

</p>

<p align="center">
    <a href="https://www.render.com/docs/">Render docs</a>
    <span>&nbsp;·&nbsp;</span>
    <a href="https://apify.com/docs">Apify docs</a>
</p>
<br/>

Learn how to build and deploy a Sendai Documentation agent with Apify, Render, and Next.js.

## What the agent does
This Sendai Documentation Agent periodically scrapes the Sendai API documentation and answers your questions about it, then emails you a report.

To use it, you:
- Specify _questions_ you want answered about the Sendai API documentation.
- Specify the _frequency_ at which you want answers for each question. (E.g. every hour, once a day, once a week)

The Agent will do the rest.

![Sendai Documentation Agent](./images/nextjs-app-preview.png)

## Table of contents
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Deploy this project on Render](#deploy-this-project-on-render)
- [Modify or run the project locally](#modify-or-run-the-project-locally)

## Project structure

- `apify-actor`: An Apify Actor that scrapes the Sendai API documentation and answers questions about it.

    This Actor is deployed on the Apify platform and can be scheduled to run periodically.
- `packages/app`: A web app that includes the UI to configure topics and questions for the Sendai Documentation agent, and the backend logic for interacting with the Apify Actor.

   This app is written in Next.js and hosted as a [web service](https://render.com/docs/web-services) on Render.

## Prerequisites
### Accounts
To run this project, you need the following accounts:

- [Render account](https://render.com/): host and scale web applications
- [Apify account](https://apify.com/): web scraping and automation platform
- [OpenRouter account](https://openrouter.ai/): Free API for accessing various LLMs
- [Resend account](https://resend.com/): API to send email

### Github code
Before you get started, please fork this repo. By having your own copy of the repo, you can freely make changes to it.

Then git clone your forked repo to your local machine.

## Deploy this project on Render

### 1. Set up the PostgreSQL database

#### What it's for
The PostgreSQL database is used to store user interests and questions.

#### Steps
To set up this database, we'll create a new PostgreSQL database on Render and initialize it with our project's schema.

Follow these steps:

1. [Create a Project on Render](https://render.com/docs/projects#setup). Name it "Sendai Documentation Agent".

2. [Create a new PostgreSQL database on Render](https://render.com/docs/postgresql-creating-connecting#create-your-database).

    - For the "Project", specify the project you created in Step 1.
    - For the "Instance Type", you may use the Free plan.

3. Initialize the database with the project's schema.

    - 3.1. Locate the `schema.sql` file in this repo.
    - 3.2. Copy your database's [external database URL](https://render.com/docs/postgresql-creating-connecting#external-connections) from the Render dashboard.
    - 3.3. Run the following command in your terminal from the root of the project, but replace the dummy PostgreSQL URL with your URL from Step 3.2:

      ```bash
      psql -Atx postgresql://<redacted>@<redacted>.render.com/<redacted> -f packages/indexer/schema.sql
      ```

### 2. Set up the Apify Actor

#### What it's for
The Apify Actor scrapes the Sendai API documentation and answers questions about it using OpenRouter's API to access various LLMs.

#### Steps

1. Create an Apify account if you don't already have one.
2. Create a new Actor on Apify:
   1. Go to the [Apify Console](https://console.apify.com/).
   2. Click on "Actors" in the left sidebar.
   3. Click "Create new" to create a new Actor.
   4. Name your Actor "sendai-documentation-agent".
   5. Choose "Use custom Dockerfile" as the source.
   6. Upload the files from the `apify-actor` directory in this repo.
   7. Set the following environment variables:
       - `OPENROUTER_API_KEY`: Your OpenRouter API key.
   8. Click "Save" to create the Actor.
3. Note your Actor's ID (you'll need it later).
4. Create an Apify API token:
   1. Go to your [Apify account settings](https://console.apify.com/account/integrations).
   2. Create a new API token.
   3. Note the token (you'll need it later).

### 3. Set up the Next.js app

#### What it's for
The Next.js app serves the UI that lets you configure the Sendai Documentation agent with questions you want answered. The app's backend interacts with the Apify Actor.

#### Steps

To set up the app, we'll create a new web service on Render and configure it to run the Next.js application. The code is located in the `packages/app` directory.

1. Create a new web service on Render [using these instructions](https://render.com/docs/web-services#deploy-from-github--gitlab--bitbucket).
    1. Choose the **Git provider** option, and select the GitHub repo you forked. Click **Connect**.
    2. In the service creation form, provide the following details:
        | Field | Value|
        |---|---|
        | Language | Node |
        | Root Directory | `packages/app/` |
        | Build Command | `pnpm install; pnpm build` |
        | Start Command | `pnpm start` |
        | Instance type | Starter (this app runs too slowly on the Free plan) |
    3. Configure the following environment variables:
        - `DATABASE_URL`: The _external URL_ of your PostgreSQL database ([here's how to find it](https://render.com/docs/postgresql-creating-connecting#external-connections)).
        - `OPENROUTER_API_KEY`: Your OpenRouter API Key.
        - `RESEND_API_KEY`: Your Resend API Key.
        - `APIFY_API_TOKEN`: Your Apify API token.
        - `SENDAI_ACTOR_ID`: Your Apify Actor ID.
        - `APP_PASSWORD`: A custom password. You must enter this password to gain access to your app.
2. Click **Deploy Web Service**.

After the deploy finishes, your service will be accessible at the `onrender.com` URL displayed in the dashboard.

### 4. Set up Apify Webhooks

To enable automatic email notifications when the Apify Actor completes a run, we need to set up a webhook.

1. Go to your [Apify Console](https://console.apify.com/).
2. Click on "Webhooks" in the left sidebar.
3. Click "Create new webhook".
4. Configure the webhook:
   - Name: "Sendai Documentation Agent Webhook"
   - Event types: Select "Actor run succeeded"
   - Actions: Select your "sendai-documentation-agent" Actor
   - Request URL: `https://<your-app-name>.onrender.com/api/apify`
   - Payload template: Leave as default
5. Click "Save" to create the webhook.

### 5. Try it out!

You're now ready to try out your Sendai Documentation Agent.

1. Go to your Render Web Service dashboard and click on the URL of your web service (ex: https://sendai-documentation-agent.onrender.com).
2. Log into your app using the `APP_PASSWORD` you specified. You'll then see the homepage.
3. Add an interest and an email address where you want email updates to be sent. Then add a question for your Sendai Documentation Agent to answer for you and specify the frequency at which you want the Agent to update you.

4. Try out the app. You can sit back and wait for the next time your Agent runs, which will be determined by the frequency you specified for your question(s). If you want an instant result, click "[ preview ]" next to any question in the UI. 

## Modify or run the project locally

Install dependencies by running the following command from the root of the project:

```bash
pnpm install
```

### Apify Actor (`apify-actor`)

**Run the Apify Actor locally**

> Note: You'll need to set up the `.env` file with your `OPENROUTER_API_KEY`.

```bash
cd apify-actor
npm install
OPENROUTER_API_KEY=your_api_key node main.js
```

**Deploy the Apify Actor**

1. Install the Apify CLI:

```bash
npm install -g apify-cli
```

2. Log in to your Apify account:

```bash
apify login
```

3. Deploy the Actor:

```bash
cd apify-actor
apify push
```

### Next.js app (`packages/app`)

> Note: You'll need to set up the `.env.local` file.
> Don't forget to set the `APP_PASSWORD` password

**Run the Next.js app locally**

```bash
cd packages/app
pnpm dev
```

## Migration from Inngest to Apify

This project was originally built using Inngest for agent orchestration. It has been migrated to use Apify for web scraping and automation. Here are the key changes:

1. **Replaced Inngest with Apify:**
   - Removed Inngest-related code and dependencies.
   - Added Apify Actor for scraping the Sendai API documentation.
   - Added Apify client integration in the Next.js app.

2. **Changed Data Source:**
   - Previously: Scraped Hacker News and stored in a vector database.
   - Now: Scrapes the Sendai API documentation directly when needed.

3. **Updated API Routes:**
   - Added `/api/apify` route to handle Apify webhook callbacks.
   - Updated `/api/questions` and `/api/preview` routes to use Apify instead of Inngest.

4. **Environment Variables:**
   - Removed Inngest-related environment variables.
   - Added Apify-related environment variables (`APIFY_API_TOKEN`, `SENDAI_ACTOR_ID`).