import { createMistral } from "@ai-sdk/mistral";
import dotenv from "dotenv";
dotenv.config();

export const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: "https://api.mistral.ai/v1",
});
