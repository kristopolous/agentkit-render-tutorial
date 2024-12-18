import { NextResponse } from "next/server";
import { getInterests, createInterest, deleteInterest } from "@/lib/db";

export async function GET() {
  try {
    const interests = await getInterests();
    return NextResponse.json(interests);
  } catch (error) {
    console.error("Error fetching interests:", error);
    return NextResponse.json(
      { error: "Failed to fetch interests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const interest = await createInterest(name, email);
    return NextResponse.json(interest);
  } catch (error) {
    console.error("Error creating interest:", error);
    return NextResponse.json(
      { error: "Failed to create interest" },
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
        { error: "Interest ID is required" },
        { status: 400 }
      );
    }

    await deleteInterest(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting interest:", error);
    return NextResponse.json(
      { error: "Failed to delete interest" },
      { status: 500 }
    );
  }
}
