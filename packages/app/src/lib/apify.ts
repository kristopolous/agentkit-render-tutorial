import { ApifyClient } from 'apify-client';

// Create a client to interact with the Apify API
export const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

// Actor ID for the Sendai documentation agent
export const SENDAI_ACTOR_ID = process.env.SENDAI_ACTOR_ID || 'your-actor-id';

// Default model to use with OpenRouter
export const DEFAULT_MODEL = 'anthropic/claude-3-opus';

// Function to run the Sendai documentation agent
export async function runSendaiActor(question: string, model: string = DEFAULT_MODEL) {
  console.log(`Running Sendai actor with question: ${question}`);
  console.log(`Using model: ${model}`);
  
  try {
    // Start the actor and wait for it to finish
    const run = await apifyClient.actor(SENDAI_ACTOR_ID).call({
      question,
      model,
    });
    
    console.log(`Actor run finished with status: ${run.status}`);
    
    // Get the actor run's dataset items
    const { items } = await apifyClient
      .dataset(run.defaultDatasetId)
      .listItems();
    
    if (items.length === 0) {
      console.warn('No items in the dataset');
      return null;
    }
    
    // Return the answer
    return items[0].answer;
  } catch (error) {
    console.error('Error running Sendai actor:', error);
    throw error;
  }
}