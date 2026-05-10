import { createXai } from "@ai-sdk/xai";
import dotenv from "dotenv";
dotenv.config();

export const grok = createXai({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});
