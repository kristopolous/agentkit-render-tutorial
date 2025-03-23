import {
  useVideoTrack,
  DailyVideo,
  DailyProvider,
} from "@daily-co/daily-react";
import { cn } from "@/lib/utils";

import { useEffect } from "react";
function Conversation({ meetingID, setMeetingID }) {
  useEffect(() => {
    const createConversation = async () => {
      try {
        const options = {
          method: "POST",
          headers: {
            "x-api-key": "c8ca30ebee28440488b558cc3bdcdabd",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            replica_id: "r79e1c033f",
            persona_id: "p9a95912",
            conversation_name: "A Meeting with Hassaan",
            conversational_context:
              "# Sendai\n\nSendai is a key component of the Solana Agent Kit (or \"Send a Kit,\" as sometimes appears in examples), an open-source toolkit designed to connect AI agents to Solana protocols. Functionally, `sendaifun` appears to be a GitHub username or organization name associated with the Solana Agent Kit project as all the examples for cloning the project code use this name.\n\n## Core Functionality\n\nThe Solana Agent Kit, developed or maintained under the `sendaifun` identifier, allows developers to build applications where AI agents can autonomously perform a wide range of actions on the Solana blockchain. These actions include, but are not limited to:\n\n*   **Token Operations:**\n    *   Deploying SPL tokens.\n    *   Transferring SOL and SPL tokens.\n    *   Checking token balances.\n    *   Staking SOL.\n    *   Launching tokens on Pump.fun.\n\n*   **NFT Management:**\n    *   Deploying NFT collections.\n    *   Minting NFTs into collections.\n    *   Listing and managing NFTs on marketplaces like Tensor.\n\n*   **DeFi Integrations:**\n    *   Performing token swaps via Jupiter Exchange.\n    *   Creating and managing liquidity pools on Raydium and Orca.\n    *   Creating markets on Manifest and OpenBook.\n    *   Interacting with lending protocols like Lulo.\n    *   Integrating with protocols like Adrena, Drift, Voltr, and Mayan.\n    *   Using price feeds from Pyth and Switchboard.\n    *   Domain management with AllDomains and Solana Name Service (SNS).\n\n*   **Other Integrations:**\n  *  Telegram Agent\n  *  Persistent agent with Postgresql\n  * LangGraph Multi-Agent System\n  * AI Guided Market Making Agent\n  * Discord Agent Integration\n  * Claude mcp\n\n*  **AI-Powered Features:**\n    * Integration with Language Models to process natural language for commands related to blockchain. The kit seems geared towards being controlled by LLMs.\n    * Tools to facilitate the integration with AI agents.\n    *  Support with autonomous agents.\n\n## Key Components\n\nThe Solana Agent Kit consists of several key classes and utilities:\n\n*   **`SolanaAgentKit`:**  The main class for interacting with the Solana blockchain. It provides a unified interface for various operations.\n*   **`createSolanaTools`:**  A function that generates a set of LangChain tools based on the capabilities of the `SolanaAgentKit`.\n*   **`createVercelAITools`:** A set of tools made for Vercel AI integration with the kit.\n*   **Actions:** Predefined operations that agents can perform, such as transferring tokens, deploying tokens, minting NFTs, etc.\n*   **Utilities:** Helper functions for common tasks like finding actions, executing actions, and getting example prompts.\n\n## Getting Started\n1.  **Setup**\nFirst, you'll need to configure your local enviroment.\n\n```\nnpm install -g degit\n```\n\n2. Install the project dependancies that are necessary for development.\n\n```\npnpm install\n```\n## Example Usage (Conceptual)\n\n```javascript\nimport { SolanaAgentKit, createSolanaTools } from \"solana-agent-kit\";\n\n// Initialize the agent kit with your wallet's private key, RPC URL, and OpenAI API key\nconst agent = new SolanaAgentKit(\n  \"your-wallet-private-key-as-base58\",\n  \"https://api.mainnet-beta.solana.com\",\n  \"your-openai-api-key\"\n);\n\n// Create LangChain tools, which allows your agent to use natural language to query.\nconst tools = createSolanaTools(agent);\n\n// Now you can use the agent to perform actions, for example, deploying a token:\nconst result = await agent.deployToken(\n  \"My New Token\",  // Token name\n  \"MNT\",            // Token symbol\n  \"https://arweave.net/my-token-metadata.json\",       // Metadata URI\n  9,                  // Decimals (optional, defaults to a standard value)\n  1000000            // Initial supply (optional)\n);\n\nconsole.log(\"Token deployed. Mint address:\", result.mint.toString());\n\n// Or mint an NFT into a collection:\nconst nftResult = await agent.mintNFT(\n    new PublicKey(\"collection-mint-address\"), //the address of your collection\n    {\n        name: \"Unique NFT #1\",\n        uri: \"https://arweave.net/nft-metadata.json\"\n    },\n);\n```\n\nIn essence, Sendai (or `sendaifun`) signifies the origin or the entity behind the Solana Agent Kit, a toolkit facilitating the integration of AI agents with the Solana blockchain and its diverse set of protocols. This allows for complex, AI-driven interactions within the Solana ecosystem programmatically.",
            custom_greeting:
              "Hey there, what can I help you with on solana today?",
            properties: {
              max_call_duration: 3600,
              participant_left_timeout: 0,
              participant_absent_timeout: 30,
              language: "english",
            },
          }),
        };

        const response = await fetch(
          "https://tavusapi.com/v2/conversations",
          options
        );
        const responseJSON = await response.json();

        // Now you can access the conversation_url property
        setMeetingID(responseJSON.conversation_url);

        console.log("Response status:", response.status);
        console.log("Response JSON:", responseJSON);
        console.log("Conversation URL:", responseJSON.conversation_url);
      } catch (err) {
        console.log(err);
      }
    };

    createConversation();
  }, []);

  console.log(meetingID);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '320px', width: '100%' }}>
      <iframe
        title="video-call"
        allow="camera; microphone; fullscreen; display-capture"
        className="video-placeholder"
        src={meetingID}
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
}

export default Conversation;
