#!/usr/bin/env node
import { CheerioCrawler } from 'crawlee';
import fetch from 'node-fetch';
import fs from 'fs';
import { URL } from 'url';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Load input from input.json
  let input;
  try {
    input = JSON.parse(fs.readFileSync('input.json', 'utf-8'));
  } catch (error) {
    console.error('Error reading input.json:', error);
    return;
  }

  console.log('Input:', input);

  // Get the root website URL from input or use default
  const rootWebsite = input.rootWebsite || 'https://nodejs.org/docs/latest/api/';
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

      // Store the extracted data
      // Instead of Apify's pushData, write to a file or store in a variable
      // For simplicity, we'll just log it for now.
      // await Actor.pushData(data); // Removed Apify-specific code
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
  // const dataset = await Actor.openDataset(); // Removed Apify-specific code
  // const { items } = await dataset.getData(); // Removed Apify-specific code
    const items = []; // Replace with actual scraped data if needed

  // console.log('Scraped data items:', items.length); // Keep for debugging

  if (items.length === 0) {
    console.warn('No data was scraped.'); // Changed to warn, as it might still work
    // return; // Don't exit, continue to generate response even without scraped data
  }

  // Format the scraped data for the prompt
  // This part needs to be adjusted based on how you store the scraped data
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

  // Get the user's question, context, previous response, model, and preview flag from the input
  const userQuestion = input.question;
  const userContext = input.userContext || '';
  const previousResponse = input.previousResponse || '';
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
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, // Use the .env variable
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
    fs.writeFileSync('output.txt', documentation); // Write to output.txt

    // Store the documentation in the Key-Value store // Removed Apify-specific code
    // await Actor.setValue('documentation', documentation); // Removed Apify-specific code

    console.log('Documentation generated and stored successfully in output.txt');

    // Return the documentation as the Actor's output // Removed Apify-specific code
    // await Actor.pushData({ // Removed Apify-specific code
    //   question: userQuestion,
    //   userContext: userContext || null,
    //   previousResponse: documentation, // Store current documentation as previousResponse for next iteration
    //   documentation: documentation,
    //   model: model,
    //   preview: isPreview
    // });
  } catch (error) {
    console.error('Error generating response with OpenAI:', error);
  }
}

main();
