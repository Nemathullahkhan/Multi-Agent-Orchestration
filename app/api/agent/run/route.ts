"use server";
import { mistral } from "@/lib/mistral";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await generateText({
    model: mistral("mistral-small-latest"),
    prompt: "Which model are you?",
  });
  console.log(result);
  return NextResponse.json({
    text: result.text,
  });
}
