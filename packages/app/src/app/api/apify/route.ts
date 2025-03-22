import { NextResponse } from "next/server";
import { apifyClient } from "@/lib/apify";
import fs from 'fs';
import path from 'path';

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

    const documentation = items[0].documentation;
    const question = items[0].question;
    const model = items[0].model;
    const isPreview = items[0].preview === true;
    
    console.info("[SendaiAgent] Processing webhook for run:", {
      runId,
      question,
      model,
      isPreview,
      documentationLength: documentation ? documentation.length : 0,
    });
    
    // If this is a preview run, don't save the file
    if (isPreview) {
      console.info("[SendaiAgent] Preview run, skipping file save");
      return NextResponse.json({ success: true, preview: true });
    }
    
    // Create a filename based on the question
    const sanitizedQuestion = question
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
    
    const filename = `${sanitizedQuestion}-${Date.now()}.md`;
    
    // Create docs directory if it doesn't exist
    const docsDir = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    // Write the documentation to a file
    try {
      const filePath = path.join(docsDir, filename);
      
      // Add metadata at the top of the file
      const fileContent = `---
title: ${question}
model: ${model}
date: ${new Date().toISOString()}
---

${documentation}`;
      
      fs.writeFileSync(filePath, fileContent);
      console.info(`[SendaiAgent] Documentation saved to: ${filePath}`);
    } catch (error) {
      console.error("[SendaiAgent] Error saving documentation to file:", error);
      return NextResponse.json(
        { error: "Failed to save documentation" },
        { status: 500 }
      );
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