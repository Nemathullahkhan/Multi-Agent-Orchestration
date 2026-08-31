import { Sandbox } from "e2b";
import { generateText, Output } from "ai";
import { z } from "zod";
import { grok } from "@/lib/models/grok";

const model = grok("grok-3-mini");

/* -------------------------------------------------------------------------- */
/*                                   SCHEMA                                   */
/* -------------------------------------------------------------------------- */

const PageSchema = z.object({
  code: z.string(),
});

/* -------------------------------------------------------------------------- */
/*                               SYSTEM PROMPT                                */
/* -------------------------------------------------------------------------- */

const SYSTEM_PROMPT = `
You are a senior Next.js engineer.

Generate ONLY valid code for:
app/page.tsx

Rules:
- Use TypeScript
- Use Tailwind CSS
- Use "use client" when needed
- Export default Page component
- Return ONLY code
- No markdown
- No explanations
`;

/* -------------------------------------------------------------------------- */
/*                              GENERATE + RUN                                */
/* -------------------------------------------------------------------------- */

export async function generateSPA(userPrompt: string) {
  try {
    // Create sandbox
    const sandbox = await Sandbox.create("nextjs-template");

    console.log("✅ Sandbox created");

    // Generate page.tsx
    const result = await generateText({
      model,

      system: SYSTEM_PROMPT,

      prompt: userPrompt,

      output: Output.object({
        schema: PageSchema,
      }),

      temperature: 0.1,
      maxOutputTokens: 2000,
    });

    const code = result.output.code;

    console.log("Code - ", code);

    console.log("✅ Code generated");

    // Write app/page.tsx
    await sandbox.files.write("/home/user/app/page.tsx", code);

    console.log("✅ page.tsx written");

    // Start dev server
    sandbox.commands.run("npm run dev", {
      cwd: "/home/user",
      background: true,
    });

    console.log("✅ Dev server started");

    // Preview URL
    const previewUrl = `https://${sandbox.getHost(3000)}`;

    console.log("🚀 Preview URL:", previewUrl);

    return {
      success: true,
      previewUrl,
      code,
    };
  } catch (error) {
    console.log("SPA GENERATION ERROR", error);
  }
}

