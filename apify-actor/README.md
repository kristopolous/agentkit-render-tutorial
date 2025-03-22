# Sendai Documentation Agent

This Apify Actor scrapes the Sendai API documentation and answers questions about it using OpenRouter's API to access various LLMs.

## Features

- Scrapes the Sendai API documentation from https://docs.sendai.fun/v0/introduction
- Extracts headings and introduction text
- Uses OpenRouter's API to access various LLMs to answer questions about the documentation
- Stores the answers in the Actor's default dataset and Key-Value store

## Input

The Actor accepts the following input:

```json
{
  "question": "What is Sendai?",
  "model": "anthropic/claude-3-opus"
}
```

- `question` (required): The question you want to ask about the Sendai API documentation.
- `model` (optional): The OpenRouter model to use for answering the question. Default is "anthropic/claude-3-opus". Available options include:
  - "anthropic/claude-3-opus"
  - "anthropic/claude-3-sonnet"
  - "anthropic/claude-3-haiku"
  - "openai/gpt-4-turbo"
  - "openai/gpt-4o"
  - "openai/gpt-3.5-turbo"
  - "google/gemini-pro"
  - "meta-llama/llama-3-70b-instruct"

## Output

The Actor outputs the answer to your question in the default dataset and Key-Value store. You can access it using the Apify API or the Apify Console.

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
OPENROUTER_API_KEY=your_api_key node -e "require('apify').main(async () => { await require('./main').default({ question: 'What is Sendai?', model: 'openai/gpt-4o' }); })"
```

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

5. Run the Actor with your question.