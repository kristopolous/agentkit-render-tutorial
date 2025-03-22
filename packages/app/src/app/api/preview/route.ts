import { apifyClient, runSendaiActor } from "@/lib/apify";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

async function getActorRun(runId: string) {
  try {
    const run = await apifyClient.run(runId).get();
    
    if (!run) {
      return null;
    }
    
    // If the run is finished, get the dataset items
    if (run.status === 'SUCCEEDED') {
      const { items } = await apifyClient
        .dataset(run.defaultDatasetId)
        .listItems();
      
      return {
        finished: true,
        run,
        items,
      };
    }
    
    return {
      finished: false,
      run,
      items: [],
    };
  } catch (error) {
    console.error('Error fetching actor run:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return notFound();
  }

  const result = await getActorRun(id);
  
  if (!result) {
    return notFound();
  }
  
  if (result.finished && result.items.length > 0) {
    return NextResponse.json({
      finished: true,
      preview: result.items[0].answer,
    });
  } else {
    return NextResponse.json({
      finished: false,
      preview: null,
      status: result.run?.status,
    });
  }
}

export async function POST(request: Request) {
  const { question, model } = await request.json();

  if (!question) {
    return NextResponse.json(
      { error: "Question is required" },
      { status: 400 }
    );
  }

  try {
    // Start the actor run
    const run = await apifyClient.actor(process.env.SENDAI_ACTOR_ID || '').call({
      question,
      model, // Pass the model if provided
    });

    return NextResponse.json({ runId: run.id });
  } catch (error) {
    console.error('Error starting actor run:', error);
    return NextResponse.json(
      { error: "Failed to start actor run" },
      { status: 500 }
    );
  }
}
