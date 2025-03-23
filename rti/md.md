# Sendai

Sendai is a key component of the Solana Agent Kit (or "Send a Kit," as sometimes appears in examples), an open-source toolkit designed to connect AI agents to Solana protocols. Functionally, `sendaifun` appears to be a GitHub username or organization name associated with the Solana Agent Kit project as all the examples for cloning the project code use this name.

## Core Functionality

The Solana Agent Kit, developed or maintained under the `sendaifun` identifier, allows developers to build applications where AI agents can autonomously perform a wide range of actions on the Solana blockchain. These actions include, but are not limited to:

*   **Token Operations:**
    *   Deploying SPL tokens.
    *   Transferring SOL and SPL tokens.
    *   Checking token balances.
    *   Staking SOL.
    *   Launching tokens on Pump.fun.

*   **NFT Management:**
    *   Deploying NFT collections.
    *   Minting NFTs into collections.
    *   Listing and managing NFTs on marketplaces like Tensor.

*   **DeFi Integrations:**
    *   Performing token swaps via Jupiter Exchange.
    *   Creating and managing liquidity pools on Raydium and Orca.
    *   Creating markets on Manifest and OpenBook.
    *   Interacting with lending protocols like Lulo.
    *   Integrating with protocols like Adrena, Drift, Voltr, and Mayan.
    *   Using price feeds from Pyth and Switchboard.
    *   Domain management with AllDomains and Solana Name Service (SNS).

*   **Other Integrations:**
  *  Telegram Agent
  *  Persistent agent with Postgresql
  * LangGraph Multi-Agent System
  * AI Guided Market Making Agent
  * Discord Agent Integration
  * Claude mcp

*  **AI-Powered Features:**
    * Integration with Language Models to process natural language for commands related to blockchain. The kit seems geared towards being controlled by LLMs.
    * Tools to facilitate the integration with AI agents.
    *  Support with autonomous agents.

## Key Components

The Solana Agent Kit consists of several key classes and utilities:

*   **`SolanaAgentKit`:**  The main class for interacting with the Solana blockchain. It provides a unified interface for various operations.
*   **`createSolanaTools`:**  A function that generates a set of LangChain tools based on the capabilities of the `SolanaAgentKit`.
*   **`createVercelAITools`:** A set of tools made for Vercel AI integration with the kit.
*   **Actions:** Predefined operations that agents can perform, such as transferring tokens, deploying tokens, minting NFTs, etc.
*   **Utilities:** Helper functions for common tasks like finding actions, executing actions, and getting example prompts.

## Getting Started
1.  **Setup**
First, you'll need to configure your local enviroment.

```
npm install -g degit
```

2. Install the project dependancies that are necessary for development.

```
pnpm install
```
## Example Usage (Conceptual)

```javascript
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";

// Initialize the agent kit with your wallet's private key, RPC URL, and OpenAI API key
const agent = new SolanaAgentKit(
  "your-wallet-private-key-as-base58",
  "https://api.mainnet-beta.solana.com",
  "your-openai-api-key"
);

// Create LangChain tools, which allows your agent to use natural language to query.
const tools = createSolanaTools(agent);

// Now you can use the agent to perform actions, for example, deploying a token:
const result = await agent.deployToken(
  "My New Token",  // Token name
  "MNT",            // Token symbol
  "https://arweave.net/my-token-metadata.json",       // Metadata URI
  9,                  // Decimals (optional, defaults to a standard value)
  1000000            // Initial supply (optional)
);

console.log("Token deployed. Mint address:", result.mint.toString());

// Or mint an NFT into a collection:
const nftResult = await agent.mintNFT(
    new PublicKey("collection-mint-address"), //the address of your collection
    {
        name: "Unique NFT #1",
        uri: "https://arweave.net/nft-metadata.json"
    },
);

```

In essence, Sendai (or `sendaifun`) signifies the origin or the entity behind the Solana Agent Kit, a toolkit facilitating the integration of AI agents with the Solana blockchain and its diverse set of protocols. This allows for complex, AI-driven interactions within the Solana ecosystem programmatically.
