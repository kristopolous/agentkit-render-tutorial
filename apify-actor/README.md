# Sendai Documentation Generator Actor - Updated

This Apify Actor crawls a website (defaulting to Sendai API documentation), processes the content and generates comprehensive markdown documentation answering a user's question using OpenRouter's API to access various LLMs.  The Actor now accepts the URL of *any* website that exposes a `sitemap.xml` for crawling.

## Features

- **Crawls any website**: Using a provided root URL and `sitemap.xml`, the Actor scrapes web content.
- **Documentation Generation**: Extracts content relevant to the user's question.
- **OpenRouter Integration**: Uses OpenRouter to access state-of-the-art LLMs to generate detailed markdown documentation.  Leverages models with large context windows for complex queries.
- **Flexible Models**: Supports multiple LLMs via OpenRouter, allowing users to select the best model for their needs.
- **Contextual Responses**:  Optionally includes a user context and previous AI response to refine results in iterative runs.
- **Comprehensive Output**: Generates well-structured markdown with tables, code examples, and lists.
- **Persistence**: Stores generated documentation in the Actor's default dataset and Key-Value store.

## Input Schema

The Actor accepts the following input:

```json
{
  "rootWebsite": "https://docs.sendai.fun",
  "question": "What is the Sendai API and how do I use it?",
  "userContext": "A developer familiar with JavaScript and React who wants to build a simple integration with the Sendai API.",
  "previousResponse": "",
  "model": "google/gemini-2.0-pro-exp-02-05:free",
  "preview": false
}
```

The input schema is defined in the actor and will be displayed in the Apify Console:

```json
{
  "title": "Sendai Documentation Query",
  "type": "object",
  "schemaVersion": 1,
  "properties": {
    "rootWebsite": {
      "title": "Root Website URL",
      "type": "string",
      "description": "The root website URL to crawl (will look for sitemap.xml at this URL)",
      "editor": "textfield",
      "default": "https://docs.sendai.fun"
    },
    "question": {
      "title": "Question",
      "type": "string",
      "description": "The question you want to ask about the Sendai API documentation",
      "editor": "textfield"
    },
    "userContext": {
      "title": "User Context",
      "type": "string",
      "description": "Profile of the user (e.g., 'a developer familiar with JavaScript and React')",
      "editor": "textfield",
      "default": ""
    },
    "previousResponse": {
      "title": "Previous Response",
      "type": "string",
      "description": "The previous response from the AI model (for iterative refinement)",
      "editor": "textarea",
      "default": ""
    },
    "model": {
      "title": "Model",
      "type": "string",
      "description": "The OpenRouter model to use for answering the question",
      "editor": "select",
      "default": "google/gemini-2.0-pro-exp-02-05:free",
      "enum": [
        "anthropic/claude-3-opus",
        "anthropic/claude-3-sonnet",
        "anthropic/claude-3-haiku",
        "openai/gpt-4-turbo",
        "openai/gpt-4o",
        "openai/gpt-3.5-turbo",
        "google/gemini-2.0-pro-exp-02-05:free",
        "meta-llama/llama-3-70b-instruct"
      ],
      "enumTitles": [
        "Claude 3 Opus",
        "Claude 3 Sonnet",
        "Claude 3 Haiku",
        "GPT-4 Turbo",
        "GPT-4o",
        "GPT-3.5 Turbo",
        "Gemini Pro",
        "Llama 3 70B"
      ]
    },
    "preview": {
      "title": "Preview",
      "type": "boolean",
      "description": "Whether this is a preview run (will not save documentation to file)",
      "default": false
    }
  },
  "required": ["question"]
}
```

- `rootWebsite` (optional): The root URL of the website to crawl.  The Actor will attempt to locate the `sitemap.xml` file at `/sitemap.xml` of this URL.  Defaults to `https://docs.sendai.fun`.
- `question` (required): The topic or question you want documentation for about the specified API.
- `userContext` (optional): A description of the user asking the question. This helps the model generate more relevant and tailored responses. Example: "A beginner programmer learning JavaScript". Defaults to "".
- `previousResponse` (optional): The previous response from the AI model. Use this to refine the documentation in iterative runs. Defaults to "".
- `model` (optional): The OpenRouter model to use for generating the documentation. Default is "google/gemini-2.0-pro-exp-02-05:free" (2M token context window), which is recommended for its large context window.  Available options include:
    - `"google/gemini-2.0-pro-exp-02-05:free"` (**Recommended**: Large Context Window)
    - `"anthropic/claude-3-opus"`
    - `"anthropic/claude-3-sonnet"`
    - `"anthropic/claude-3-haiku"`
    - `"openai/gpt-4-turbo"`
    - `"openai/gpt-4o"`
    - `"openai/gpt-3.5-turbo"`
    - `"meta-llama/llama-3-70b-instruct"`
- `preview` (optional): Whether this is a preview run. If set to `true`, the documentation will not be saved to a file when the webhook is triggered. Default is `false`.

## Output

The Actor outputs comprehensive markdown documentation about the requested topic in the default dataset and Key-Value store. The documentation includes:

- A table of contents
- Well-structured sections with proper markdown formatting
- Code examples where appropriate
- Detailed explanations of the requested topic
- Considerations for specific user profiles included in `userContext`

You can access the documentation using the Apify API or the Apify Console.

## Environment Variables

The Actor requires the following environment variables:

- `OPENROUTER_API_KEY`: Your OpenRouter API key.  Get this from [OpenRouter's website](https://openrouter.ai/).

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Run the Actor locally:

```bash
OPENROUTER_API_KEY=your_api_key node main.js
```

You can also specify a custom input with the question:

```bash
OPENROUTER_API_KEY=your_api_key node -e "require('apify').main(async () => { await require('./main').default({ question: 'What is Sendai?', model: 'google/gemini-2.0-pro-exp-02-05:free' }); })"
```

The documentation will be generated as a string in the console.

## Deployment to Apify

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
apify push
```

4. Set the `OPENROUTER_API_KEY` environment variable in the Apify Console, under the "Env Vars" tab on in the Actor's settings.

5. Run the Actor with your question to generate comprehensive markdown documentation.

## Sample Documentation Output

The generated documentation is:

1.  Stored in the Actor's default dataset and Key-Value store.
2.  Saved as a markdown file in the `docs` directory (when running via webhook, if `preview` is false).
3.  Formatted with proper markdown syntax including:
    - Headers and subheaders
    - Code blocks
    - Tables
    - Lists
    - Links
    - Other markdown formatting as needed

This makes it easy to integrate the documentation into existing documentation systems or to publish it directly on platforms that support markdown.

**Example Output:**  Assuming the question is "How do I authenticate with the Sendai API using JWTs?"

```markdown
# Authenticating with the Sendai API using JWTs

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Obtaining an API Key](#obtaining-an-api-key)
- [Generating a JWT Token](#generating-a-jwt-token)
- [Using the JWT Token in API Requests](#using-the-jwt-token-in-api-requests)
- [Example Code (JavaScript)](#example-code-javascript)
- [Token Expiration and Refresh](#token-expiration-and-refresh)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Conclusion](#conclusion)

## Introduction

The Sendai API uses JSON Web Tokens (JWTs) for authentication. JWTs are a standard method for securely representing claims between two parties. This documentation will guide you through the process of obtaining an API key, generating a JWT token, and using it to authenticate your requests to the Sendai API.

## Prerequisites

Before you begin, you'll need:

- An account with Sendai.
- Node.js and npm installed (if you plan to use the JavaScript example).
- A JWT library for your preferred programming language (e.g., `jsonwebtoken` for JavaScript).

## Obtaining an API Key

1.  Log in to your Sendai account.
2.  Navigate to the API Keys section in your profile settings.
3.  Generate a new API key.  Ensure you store this key securely, as it will be used to sign your JWTs.

## Generating a JWT Token

To generate a JWT token, you'll need to include the following claims:

-   `iss`:  The issuer of the token (your Sendai user ID).
-   `sub`: The subject of the token (typically your Sendai application ID).
-   `iat`: The "issued at" timestamp (in seconds since epoch).
-   `exp`: The expiration timestamp (in seconds since epoch).  Example: `iat + (60 * 60)` for one hour.

Here's how you can generate a JWT token:

```javascript
const jwt = require('jsonwebtoken');

const apiKey = 'YOUR_SENDAI_API_KEY';
const userId = 'YOUR_SENDAI_USER_ID';
const applicationId = 'YOUR_SENDAI_APPLICATION_ID';

const payload = {
  iss: userId,
  sub: applicationId,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // Token expires in 1 hour
};

const token = jwt.sign(payload, apiKey, { algorithm: 'HS256' });

console.log(token);
```

## Using the JWT Token in API Requests

To use the JWT token, include it in the `Authorization` header of your API requests as a Bearer token:

```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

Example using `curl`:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" https://api.sendai.fun/v0/endpoint
```
## ... (Rest of the documentation) ...
```

