# Sendai Documentation Generator

This Apify Actor scrapes the Sendai API documentation and generates comprehensive markdown documentation based on user questions using OpenRouter's API to access various LLMs.

## Features

- Scrapes the Sendai API documentation from https://docs.sendai.fun/v0/introduction
- Extracts headings and introduction text
- Uses OpenRouter's Gemini Pro model (with 2M token context window) to generate detailed markdown documentation
- Stores the generated documentation in the Actor's default dataset and Key-Value store

## Input

The Actor accepts the following input:

```json
{
  "question": "What is Sendai?",
  "model": "google/gemini-2.0-pro-exp-02-05:free",
  "preview": false
}
```

- `question` (required): The topic or question you want documentation for about the Sendai API.
- `model` (optional): The OpenRouter model to use for generating the documentation. Default is "google/gemini-2.0-pro-exp-02-05:free" (2M token context window). Available options include:
  - "google/gemini-2.0-pro-exp-02-05:free" (recommended for its 2M token context window)
  - "anthropic/claude-3-opus"
  - "anthropic/claude-3-sonnet"
  - "anthropic/claude-3-haiku"
  - "openai/gpt-4-turbo"
  - "openai/gpt-4o"
  - "openai/gpt-3.5-turbo"
  - "meta-llama/llama-3-70b-instruct"
- `preview` (optional): Whether this is a preview run. If set to `true`, the documentation will not be saved to a file when the webhook is triggered. Default is `false`.

## Output

The Actor outputs comprehensive markdown documentation about the requested topic in the default dataset and Key-Value store. The documentation includes:

- A table of contents
- Well-structured sections with proper markdown formatting
- Code examples where appropriate
- Detailed explanations of the requested topic

You can access the documentation using the Apify API or the Apify Console.

## Environment Variables

The Actor requires the following environment variables:

- `OPENROUTER_API_KEY`: Your OpenRouter API key.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Run the Actor locally:

```bash
OPENROUTER_API_KEY=your_api_key node main.js
```

You can also specify a custom input with a specific model:

```bash
OPENROUTER_API_KEY=your_api_key node -e "require('apify').main(async () => { await require('./main').default({ question: 'What is Sendai?', model: 'google/gemini-pro' }); })"
```

The documentation will be generated and output to the console.

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

4. Set the `OPENROUTER_API_KEY` environment variable in the Apify Console.

5. Run the Actor with your question to generate comprehensive markdown documentation.

## Documentation Output

The generated documentation is:

1. Stored in the Actor's default dataset and Key-Value store
2. Saved as a markdown file in the `docs` directory (when running via webhook)
3. Formatted with proper markdown syntax including:
   - Headers and subheaders
   - Code blocks
   - Tables
   - Lists
   - Links
   - Other markdown formatting as needed

This makes it easy to integrate the documentation into existing documentation systems or to publish it directly on platforms that support markdown.