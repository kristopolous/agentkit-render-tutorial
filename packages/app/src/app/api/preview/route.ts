import { inngest } from "@/inngest/client";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

async function getRuns(eventId: string) {
  const response = await fetch(
    process.env.INNGEST_SIGNING_KEY
      ? `https://api.inngest.com/v1/events/${eventId}/runs`
      : `http://localhost:8288/v1/events/${eventId}/runs`,
    {
      ...(process.env.INNGEST_SIGNING_KEY
        ? {
            headers: {
              Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
            },
          }
        : {}),
    }
  );
  const json = await response.json();
  return json.data;
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  const runs = await getRuns(id as string);
  if (runs && runs[0]) {
    const run = runs[0];
    if (run.output && run.output.answers) {
      return NextResponse.json({
        finished: true,
        preview: run.output.answers,
      });
    } else {
      return NextResponse.json({
        finished: false,
        preview: null,
      });
    }
  } else {
    return notFound();
  }
}

export async function POST(request: Request) {
  const { questionId, interestId } = await request.json();

  const { ids } = await inngest.send({
    name: "hacker-news-agent/run",
    data: {
      interest_id: interestId,
      question_id: questionId,
      preview: true,
    },
  });

  return NextResponse.json({ runId: ids[0] });
}
