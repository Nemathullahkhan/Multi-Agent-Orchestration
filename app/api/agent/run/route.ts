"use server";
import { grok } from "@/lib/models/grok";
import { generateText } from "ai";
import { NextResponse } from "next/server";

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
