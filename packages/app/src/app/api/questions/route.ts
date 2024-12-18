import { NextResponse } from "next/server";
import { getQuestions, createQuestion, deleteQuestion } from "@/lib/db";
import { inngest } from "@/inngest/client";
import { computeNextRunDate } from "@/inngest/utils";

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
    const { interest_id, question, frequency } = await request.json();

    if (!interest_id || !question || !frequency) {
      return NextResponse.json(
        { error: "Interest ID, question, and frequency are required" },
        { status: 400 }
      );
    }

    const newQuestion = await createQuestion(interest_id, question, frequency);

    const nextRunDate = computeNextRunDate(frequency);

    inngest.send({
      name: "hacker-news-agent/run",
      ts: nextRunDate.getTime(),
      data: {
        interest_id,
        question_id: newQuestion.id,
      },
    });

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
