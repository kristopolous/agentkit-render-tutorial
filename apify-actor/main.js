import { Actor } from 'apify';
import { CheerioCrawler } from 'crawlee';
import fetch from 'node-fetch';
import fs from 'fs';
import { URL } from 'url';

Actor.main(async () => {
  let input = await Actor.getInput();
  console.log('Input:', input);
  
  // Get the root website URL from input or use default
  const rootWebsite = input.rootWebsite || 'https://docs.sendai.fun';
  console.log('Root website:', rootWebsite);

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

    // Function to fetch and parse sitemap.xml
    async function fetchSitemapUrls(rootUrl) {
      try {
        // Normalize the root URL
        if (!rootUrl.endsWith('/')) {
          rootUrl = rootUrl + '/';
        }
        
        const sitemapUrl = new URL('sitemap.xml', rootUrl).toString();
        console.log(`Fetching sitemap from: ${sitemapUrl}`);
        
        const response = await fetch(sitemapUrl);
        
        if (!response.ok) {
          console.error(`Failed to fetch sitemap.xml: ${response.status} ${response.statusText}`);
          // Return a fallback URL if sitemap.xml is not found
          return [rootUrl];
        }
        
        const sitemapXml = await response.text();
        
        // Create a Cheerio instance to parse the XML
        const cheerio = require('cheerio');
        const $ = cheerio.load(sitemapXml, {
          xmlMode: true
        });
        
        // Extract URLs from the sitemap
        const urls = [];
        $('url > loc').each((_, element) => {
          const url = $(element).text().trim();
          if (url) {
            urls.push(url);
          }
        });
        
        console.log(`Found ${urls.length} URLs in sitemap.xml`);
        
        // If no URLs were found, return the root URL as a fallback
        if (urls.length === 0) {
          console.warn('No URLs found in sitemap.xml, using root URL as fallback');
          return [rootUrl];
        }
        
        return urls;
      } catch (error) {
        console.error('Error fetching or parsing sitemap.xml:', error);
        // Return the root URL as a fallback
        return [rootUrl];
      }
    }
    
    // Fetch URLs from sitemap.xml
    const urlsToScrape = await fetchSitemapUrls(rootWebsite);
    console.log(`Will scrape ${urlsToScrape.length} URLs`);
    
    // Run the crawler with the URLs from the sitemap
    await crawler.run(urlsToScrape);

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
  // Get the user's question, context, previous response, model, and preview flag from the input
  const userQuestion = input.question || 'What is Sendai?';
  const userContext = input.userContext || '';
  const previousResponse = input.previousResponse || '';
  // Default to Gemini Pro for its 2 million token context window
  const model = input.model || 'google/gemini-2.0-pro-exp-02-05:free';
  const isPreview = input.preview === true;
  
  console.log('Processing user question:', userQuestion);
  console.log('User context:', userContext || '(None provided)');
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

${userContext ? `The user's context/profile is: ${userContext}
Tailor the documentation to this user profile, adjusting the technical depth, examples, and explanations accordingly.` : ''}

Focus on creating documentation that thoroughly addresses this question/topic while providing necessary context from the scraped content.

If the scraped content doesn't contain enough information to create documentation about the requested topic, create the best documentation possible based on available information. Don't mention this is scraped content and also don't have any preambles about this being markdown. Just give the content.`
          },
          // Add previous response if provided
          ...(previousResponse ? [{ role: 'assistant', content: previousResponse }] : []),
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
    
    // Store the documentation in the Key-Value store
    await Actor.setValue('documentation', documentation);
    
    console.log('Documentation generated and stored successfully');
    
    // Return the documentation as the Actor's output
    await Actor.pushData({
      question: userQuestion,
      userContext: userContext || null,
      previousResponse: documentation, // Store current documentation as previousResponse for next iteration
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
