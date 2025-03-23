from flask import Flask, request, jsonify
from apify_client import ApifyClient
from daily import Dailyw
from daily import EventHandler, CallClient
import time
import sys

app = Flask(__name__)

# You'll need to set the APIFY_API_TOKEN environment variable
# apify = ApifyClient(os.environ['APIFY_API_TOKEN'])

@app.route('/convo', methods=['POST'])
def convo():
    data = request.get_json()

    # Extract data from the request
    url = data.get('url')
    context = data.get('context')  # This isn't used yet
    previous_conversation = data.get('previous_conversation') # This isn't used yet
    question = data.get('question') # This isn't used yet

    # Initialize the ApifyClient with your API token
    apify_client = ApifyClient(request.headers.get('X-Apify-Api-Token'))

    # Prepare the Actor input
    run_input = {
        "start_urls": [{ "url": url }],
        "page_function": """async function pageFunction(context) {
            const { request, log, jQuery } = context;
            log.info(`Processing ${request.url}...`);
            const title = jQuery('title').text();
            const h1 = jQuery('h1').text();
            return {
                title: title,
                h1: h1,
            };
        }""",
    }

    # Run the Actor and wait for it to finish
    run = apify_client.actor("apify/website-content-crawler").call(run_input=run_input)

    # Fetch and return Actor results from the run's dataset (if any)
    results = []
  
    for item in apify_client.dataset(run["defaultDatasetId"]).list_items().items:
      results.append(item)

    response_data = {
        'documentation': md,
        'context': results
    }

    return jsonify(response_data)


class RoomHandler(EventHandler):
   def __init__(self):
       super().__init__()
  
   def on_app_message(self, message, sender: str) -> None:
       if(message["event_type"]=="conversation.utterance"):
           print(f"Incoming app message from {sender}: {message['properties']['speech']}")

@app.route('/join', methods=['POST'])
def join_room(url):
   global call_client
   try:
       Daily.init()
       output_handler = RoomHandler()
       call_client = CallClient(event_handler=output_handler)
       call_client.join(url)
   except Exception as e:
       print(f"Error joining room: {e}")
       raise


def run_main(url: str):
   join_room(url)


if __name__ == '__main__':
    app.run(debug=True)


