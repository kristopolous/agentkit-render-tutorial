import { Actor } from 'apify';
import { CheerioCrawler } from 'crawlee';
import fetch from 'node-fetch';

Actor.main(async () => {
  const input = await Actor.getInput();
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

      $('h1, h2, h3').each((index, element) => {
        data.headings.push({
          level: $(element).prop('tagName').toLowerCase(),
          text: $(element).text(),
        });
      });

      $('.introduction p').each((index, element) => { // Assuming introduction paragraphs have a specific class
        data.introduction.push($(element).text());
      });

      console.log('Extracted data:', data);

      // Store the extracted data in the default dataset
      await Actor.pushData(data);
    },
  });

  await crawler.run(['https://docs.sendai.fun/v0/introduction']);

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
    const introText = item.introduction.join('\n');
    
    return `
Title: ${item.title}

Headings:
${headingsText}

Introduction:
${introText}
    `;
  }).join('\n\n');
  
  // Get the user's question and model from the input
  const userQuestion = input.question || 'What is Sendai?';
  const model = input.model || 'anthropic/claude-3-opus';
  
  console.log('Processing user question:', userQuestion);
  console.log('Using model:', model);
  
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
            content: `You are an assistant that answers questions about the Sendai API documentation.
Use the following scraped documentation content to answer the user's question:

${formattedData}

If you cannot answer the question based on the provided documentation, say so clearly.`
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
    
    const answer = completion.choices[0].message.content;
    console.log('Generated answer:', answer);
    
    // Store the answer in the Key-Value store
    await Actor.setValue('answer', answer);
    
    // Return the answer as the Actor's output
    await Actor.pushData({
      question: userQuestion,
      answer: answer,
    });
  } catch (error) {
    console.error('Error generating response with OpenAI:', error);
  }
  
  // TODO: Send email (if needed)
  
  // TODO: Schedule next run (if needed)
});