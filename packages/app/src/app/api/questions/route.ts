import { NextResponse } from "next/server";
import { getQuestions, createQuestion, deleteQuestion } from "@/lib/db";
import { apifyClient, SENDAI_ACTOR_ID, runSendaiActor } from "@/lib/apify";
import { computeNextRunDate, frequencyToCron } from "@/lib/utils";

export async function GET() {
  try {
    const questions = await getQuestions();
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { interest_id, question, frequency, model } = await request.json();

    if (!interest_id || !question || !frequency) {
      return NextResponse.json(
        { error: "Interest ID, question, and frequency are required" },
        { status: 400 }
      );
    }

    const newQuestion = await createQuestion(interest_id, question, frequency);

    const nextRunDate = computeNextRunDate(frequency);

    // Schedule the Apify Actor run
    try {
      console.info("[SendaiAgent] Starting execution with data:", {
        interest_id,
        question_id: newQuestion.id,
        question,
        model,
      });
      
      // First, run the actor immediately
      console.info("[SendaiAgent] Running actor immediately");
      const documentation = await runSendaiActor(question, model);
      console.info("[SendaiAgent] Initial actor run completed", {
        documentationLength: documentation ? documentation.length : 0,
      });
      
      // Then, schedule a future run using Apify's schedules
      const nextRunDate = computeNextRunDate(frequency);
      console.info("[SendaiAgent] Scheduling next run", {
        nextRunDate,
        frequency,
      });
      
      const schedule = await apifyClient.schedules().create({
        name: `Question ${newQuestion.id} - ${frequency}`,
        cronExpression: frequencyToCron(frequency),
        isEnabled: true,
        actions: [{
          type: 'RUN_ACTOR',
          actorId: SENDAI_ACTOR_ID,
          input: {
            question,
            model,
          },
        }],
      });
      
      console.info(`[SendaiAgent] Scheduled future runs with ID: ${schedule.id}`);
    } catch (error) {
      console.error('[SendaiAgent] Error scheduling Apify Actor:', error);
      // Continue with the response even if scheduling fails
    }

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }

    await deleteQuestion(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
