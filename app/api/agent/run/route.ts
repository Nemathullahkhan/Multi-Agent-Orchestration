"use server";
import { grok } from "@/lib/models/grok";
import Orchestrator from "@/lib/orchestrator";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const result = await generateText({
    model: grok("grok-3-mini"),
    prompt: "Which model are you?",
  });
  console.log(result);
  return NextResponse.json({
    text: result.text,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userQuery } = body;

  const { sandboxId, previewUrl } = await Orchestrator(userQuery);

  return NextResponse.json({
    sandboxId,
    previewUrl,
  });
}
