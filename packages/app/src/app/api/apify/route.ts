import { NextResponse } from "next/server";
import { apifyClient } from "@/lib/apify";
import { resend } from "@/lib/resend";

/**
 * This route handles Apify webhook callbacks.
 * It's called when an Apify Actor run completes.
 */
export async function POST(request: Request) {
  try {
    const { runId, eventType } = await request.json();

    // Only process 'ACTOR.RUN.SUCCEEDED' events
    if (eventType !== 'ACTOR.RUN.SUCCEEDED') {
      return NextResponse.json({ success: true });
    }

    console.log(`Processing Apify webhook for run: ${runId}`);

    // Get the run details
    const run = await apifyClient.run(runId).get();
    
    if (!run) {
      console.error(`Run not found: ${runId}`);
      return NextResponse.json(
        { error: "Run not found" },
        { status: 404 }
      );
    }

    // Get the dataset items
    const { items } = await apifyClient
      .dataset(run.defaultDatasetId)
      .listItems();
    
    if (items.length === 0) {
      console.warn(`No items in dataset for run: ${runId}`);
      return NextResponse.json(
        { error: "No items in dataset" },
        { status: 404 }
      );
    }

    const answer = items[0].answer;
    const question = items[0].question;
    
    // Get the email from the run input (if available)
    const email = run.input?.email;
    
    if (email) {
      // Send the email
      const { data, error } = await resend.emails.send({
        from: "Sendai Documentation Agent <onboarding@resend.dev>",
        to: email,
        subject: `Your Sendai Documentation Update`,
        text: `Here are the answers to "${question}":\n\n${answer}`,
      });

      if (error) {
        console.error("Error sending email:", error);
        return NextResponse.json(
          { error: "Failed to send email" },
          { status: 500 }
        );
      }
      
      console.log("Email sent successfully");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}