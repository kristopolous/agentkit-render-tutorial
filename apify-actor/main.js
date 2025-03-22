import { Actor } from 'apify';
import { CheerioCrawler } from 'crawlee';
import fetch from 'node-fetch';
import fs from 'fs';

Actor.main(async () => {
  let input = await Actor.getInput();
  console.log('Input:', input);
  // input will be the question

  const crawler = new CheerioCrawler({
    async requestHandler({ request, response, body, $ }) {
      console.log(`Processing ${request.url}...`);
      console.log('Page title:', $('title').text());

      const data = {
        title: $('title').text(),
        headings: [],
        introduction: [],
      };

      // Extract all headings
      $('h1, h2, h3').each((index, element) => {
        data.headings.push({
          level: $(element).prop('tagName').toLowerCase(),
          text: $(element).text(),
        });
      });

      // Extract paragraphs - since there's no specific class for introduction,
      // we'll grab all paragraphs and organize them later
      data.paragraphs = [];
      $('p').each((index, element) => {
        const text = $(element).text().trim();
        if (text) {
          data.paragraphs.push(text);
        }
      });

      // Extract code blocks
      data.codeBlocks = [];
      $('pre code').each((index, element) => {
        const code = $(element).text().trim();
        if (code) {
          data.codeBlocks.push(code);
        }
      });

      // Extract lists
      data.lists = [];
      $('ul, ol').each((index, element) => {
        const items = [];
        $(element).find('li').each((i, li) => {
          items.push($(li).text().trim());
        });
        if (items.length > 0) {
          data.lists.push({
            type: $(element).prop('tagName').toLowerCase() === 'ul' ? 'unordered' : 'ordered',
            items
          });
        }
      });

      console.log('Extracted data:', data);

      // Store the extracted data in the default dataset
      await Actor.pushData(data);
    },
  });

    await crawler.run([
  "https://docs.sendai.fun/v0/classes/SolanaAgentKit",
  "https://docs.sendai.fun/v0/examples/claude_mcp",
  "https://docs.sendai.fun/v0/examples/discord_agent",
  "https://docs.sendai.fun/v0/examples/langgraph",
  "https://docs.sendai.fun/v0/examples/market_maker",
  "https://docs.sendai.fun/v0/examples/nextjs",
  "https://docs.sendai.fun/v0/examples/persistent_agent",
  "https://docs.sendai.fun/v0/examples/telegram",
  "https://docs.sendai.fun/v0/features/defi-integration/adrena",
  "https://docs.sendai.fun/v0/features/defi-integration/alldomains",
  "https://docs.sendai.fun/v0/features/defi-integration/allora",
  "https://docs.sendai.fun/v0/features/defi-integration/debridge",
  "https://docs.sendai.fun/v0/features/defi-integration/dexscreener",
  "https://docs.sendai.fun/v0/features/defi-integration/drift",
  "https://docs.sendai.fun/v0/features/defi-integration/flashtrade",
  "https://docs.sendai.fun/v0/features/defi-integration/fluxbeam",
  "https://docs.sendai.fun/v0/features/defi-integration/jupiter_exchange_swaps",
  "https://docs.sendai.fun/v0/features/defi-integration/launch_pumpfun",
  "https://docs.sendai.fun/v0/features/defi-integration/manifest_market",
  "https://docs.sendai.fun/v0/features/defi-integration/meteora",
  "https://docs.sendai.fun/v0/features/defi-integration/openbook_market",
  "https://docs.sendai.fun/v0/features/defi-integration/orca_whirlpool",
  "https://docs.sendai.fun/v0/features/defi-integration/pyth",
  "https://docs.sendai.fun/v0/features/defi-integration/raydium_pools",
  "https://docs.sendai.fun/v0/features/defi-integration/sns",
  "https://docs.sendai.fun/v0/features/defi-integration/solutiofi",
  "https://docs.sendai.fun/v0/features/defi-integration/switchboard",
  "https://docs.sendai.fun/v0/features/defi-integration/voltr",
  "https://docs.sendai.fun/v0/features/nft-management/3land_create_manage",
  "https://docs.sendai.fun/v0/features/nft-management/deploy_collection",
  "https://docs.sendai.fun/v0/features/nft-management/mint_nft",
  "https://docs.sendai.fun/v0/features/nft-management/tensor_nft",
  "https://docs.sendai.fun/v0/features/non-financial/gibwork_bounties",
  "https://docs.sendai.fun/v0/features/solana-blinks/jupsol_staking",
  "https://docs.sendai.fun/v0/features/solana-blinks/lulo",
  "https://docs.sendai.fun/v0/features/solana-blinks/send_arcade_rps",
  "https://docs.sendai.fun/v0/features/solana-blinks/solayer_restaking",
  "https://docs.sendai.fun/v0/features/squads/squads_operations",
  "https://docs.sendai.fun/v0/features/token-operations/balance_check",
  "https://docs.sendai.fun/v0/features/token-operations/coingecko",
  "https://docs.sendai.fun/v0/features/token-operations/deploy_spl_metaplex",
  "https://docs.sendai.fun/v0/features/token-operations/rugcheck_token_retrieval",
  "https://docs.sendai.fun/v0/features/token-operations/stake_sol",
  "https://docs.sendai.fun/v0/features/token-operations/tiplink_operations",
  "https://docs.sendai.fun/v0/features/token-operations/transfer_assets",
  "https://docs.sendai.fun/v0/functions/createSolanaTools",
  "https://docs.sendai.fun/v0/functions/createVercelAITools",
  "https://docs.sendai.fun/v0/functions/executeAction",
  "https://docs.sendai.fun/v0/functions/findAction",
  "https://docs.sendai.fun/v0/functions/getActionExamples",
  "https://docs.sendai.fun/v0/guides/add_your_own_tool",
  "https://docs.sendai.fun/v0/guides/setup_locally",
  "https://docs.sendai.fun/v0/guides/test_it_out",
  "https://docs.sendai.fun/v0/interfaces/Action",
  "https://docs.sendai.fun/v0/interfaces/ActionExample",
  "https://docs.sendai.fun/v0/interfaces/BatchOrderPattern",
  "https://docs.sendai.fun/v0/interfaces/CollectionDeployment",
  "https://docs.sendai.fun/v0/interfaces/CollectionOptions",
  "https://docs.sendai.fun/v0/interfaces/Config",
  "https://docs.sendai.fun/v0/interfaces/Creator",
  "https://docs.sendai.fun/v0/interfaces/FetchPriceResponse",
  "https://docs.sendai.fun/v0/interfaces/FlashCloseTradeParams",
  "https://docs.sendai.fun/v0/interfaces/FlashTradeParams",
  "https://docs.sendai.fun/v0/interfaces/GibworkCreateTaskReponse",
  "https://docs.sendai.fun/v0/interfaces/JupiterTokenData",
  "https://docs.sendai.fun/v0/interfaces/LuloAccountDetailsResponse",
  "https://docs.sendai.fun/v0/interfaces/MintCollectionNFTResponse",
  "https://docs.sendai.fun/v0/interfaces/OrderParams",
  "https://docs.sendai.fun/v0/interfaces/PumpFunTokenOptions",
  "https://docs.sendai.fun/v0/interfaces/PumpfunLaunchResponse",
  "https://docs.sendai.fun/v0/interfaces/PythFetchPriceResponse",
  "https://docs.sendai.fun/v0/interfaces/PythPriceFeedIDItem",
  "https://docs.sendai.fun/v0/interfaces/PythPriceItem",
  "https://docs.sendai.fun/v0/interfaces/TokenCheck",
  "https://docs.sendai.fun/v0/introduction",
  "https://docs.sendai.fun/v0/quickstart",
        'https://docs.sendai.fun/v0/introduction']);

  // Implement agent logic using OpenAI directly
  const dataset = await Actor.openDataset();
  const { items } = await dataset.getData();
  
  console.log('Scraped data items:', items.length);
  
  if (items.length === 0) {
    console.error('No data was scraped. Exiting.');
    return;
  }
  
  // Format the scraped data for the prompt
  const formattedData = items.map(item => {
    const headingsText = item.headings.map(h => `${h.level}: ${h.text}`).join('\n');
    
    // Format paragraphs
    const paragraphsText = item.paragraphs ? item.paragraphs.join('\n\n') : '';
    
    // Format code blocks
    const codeBlocksText = item.codeBlocks && item.codeBlocks.length > 0
      ? 'Code Examples:\n' + item.codeBlocks.map(code => '```\n' + code + '\n```').join('\n\n')
      : '';
    
    // Format lists
    const listsText = item.lists && item.lists.length > 0
      ? 'Lists:\n' + item.lists.map(list => {
          const prefix = list.type === 'unordered' ? '- ' : '1. ';
          return list.items.map(item => prefix + item).join('\n');
        }).join('\n\n')
      : '';
    
    return `
Title: ${item.title}

Headings:
${headingsText}

Content:
${paragraphsText}

${codeBlocksText}

${listsText}
    `;
  }).join('\n\n');
  
  input = {"question": "What is sendai"};
  // Get the user's question, model, and preview flag from the input
  const userQuestion = input.question || 'What is Sendai?';
  // Default to Gemini Pro for its 2 million token context window
  const model = input.model || 'google/gemini-2.0-pro-exp-02-05:free';
  const isPreview = input.preview === true;
  
  console.log('Processing user question:', userQuestion);
  console.log('Using model:', model);
  console.log('Preview mode:', isPreview ? 'Yes' : 'No');
  
  // Generate a response using OpenRouter
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://apify.com', // Replace with your site URL
        'X-Title': 'Sendai Documentation Agent'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: `You are a technical documentation expert specializing in creating comprehensive markdown documentation.

Your task is to create detailed, well-structured markdown documentation about the Sendai API based on the following scraped content:

${formattedData}

The documentation should:
1. Be comprehensive and thorough
2. Use proper markdown formatting with headings, code blocks, tables, and lists
3. Include a table of contents at the beginning
4. Be organized in a logical manner
5. Address the user's specific question or topic of interest
6. Include examples where appropriate
7. Be written in a clear, professional style suitable for developers

The user's question or topic of interest is: "${userQuestion}"

Focus on creating documentation that thoroughly addresses this question/topic while providing necessary context from the scraped content.

If the scraped content doesn't contain enough information to create documentation about the requested topic, create the best documentation possible based on available information. Don't mention this is scraped content and also don't have any preambles about this being markdown. Just give the content.`
          },
          {
            role: 'user',
            content: userQuestion
          }
        ]
      })
    });
    
    const completion = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${completion.error?.message || JSON.stringify(completion)}`);
    }
    
    const documentation = completion.choices[0].message.content;
    fs.writeFileSync('filename.txt', documentation);
    console.log(documentation);
    
    // Store the documentation in the Key-Value store
    await Actor.setValue('documentation', documentation);
    
    // Return the documentation as the Actor's output
    await Actor.pushData({
      question: userQuestion,
      documentation: documentation,
      model: model,
      preview: isPreview
    });
  } catch (error) {
    console.error('Error generating response with OpenAI:', error);
  }
  
  // Note: Email sending has been replaced with file storage as per requirements
  // Scheduling is handled by the Apify schedules API in the Next.js app
});
