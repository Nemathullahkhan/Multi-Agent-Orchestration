// import { generateText } from "ai";
// import { CODE_GENERATION_PROMPT } from "./prompts.ts";
// import { grok } from "../models/grok.ts";

// // ==================== Types ====================

// interface CodingTask {
//   id: string;
//   file_path: string;
//   type: "page" | "component" | "api" | "lib" | "hook" | "layout";
//   description: string;
// }

// interface CodingContext {
//   task: CodingTask;
//   existingFiles: string[];
//   featureName: string;
// }

// interface CodeReviewResult {
//   valid: boolean;
//   errors: string[];
//   warnings: string[];
// }

// interface CodingOutput {
//   success: boolean;
//   code: string;
//   review: CodeReviewResult;
//   imports: string[];
//   usesClient: boolean;
// }

// // ==================== Code Generation ====================

// async function generateCode(
//   task: CodingTask,
//   context: CodingContext,
// ): Promise<string> {
//   const userPrompt = `
// <task>
//   <id>${task.id}</id>
//   <file_path>${task.file_path}</file_path>
//   <type>${task.type}</type>
//   <description>${task.description}</description>
//   <feature>${context.featureName}</feature>
// </task>

// <existing_files>
// ${context.existingFiles.length > 0 ? context.existingFiles.map((f) => `  - ${f}`).join("\n") : "  (none - this is the first file)"}
// </existing_files>

// Generate the complete file content. Return ONLY the code, no explanations.
// `;

//   const model = grok("grok-3-mini");

//   const result = await generateText({
//     model,
//     system: CODE_GENERATION_PROMPT,
//     prompt: userPrompt,
//     temperature: 0.04,
//     maxTokens: 2000,
//   });

//   return result.text.trim();
// }

// // ==================== Validation ====================

// async function validateCode(
//   code: string,
//   filePath: string,
//   type: string,
// ): Promise<CodeReviewResult> {
//   const errors: string[] = [];
//   const warnings: string[] = [];

//   // Check for 'use client' when using hooks
//   const hasHooks = /use(State|Effect|Context|Reducer|Callback|Memo|Ref)/.test(
//     code,
//   );
//   const hasUseClient =
//     code.includes("'use client'") || code.includes('"use client"');

//   if (
//     hasHooks &&
//     !hasUseClient &&
//     (type === "component" || type === "hook" || type === "page")
//   ) {
//     warnings.push(
//       "Component uses React hooks but missing 'use client' directive",
//     );
//   }

//   // Check default export for pages/layouts
//   if (
//     (type === "page" || type === "layout") &&
//     !code.includes("export default")
//   ) {
//     errors.push(`${type} must have a default export`);
//   }

//   // Check shadcn import paths
//   if (code.includes("shadcn/") && !code.includes("@/components/ui/")) {
//     errors.push("Use '@/components/ui/' for shadcn imports, not 'shadcn/'");
//   }

//   // Check TypeScript any usage
//   if (code.includes(": any")) {
//     warnings.push("Avoid using 'any' type - specify proper types");
//   }

//   // Layout specific
//   if (
//     type === "layout" &&
//     !code.includes("children: { children: React.ReactNode }")
//   ) {
//     errors.push("Layout must accept children prop with proper type");
//   }

//   // Hook specific
//   if (
//     type === "hook" &&
//     !code.includes("export function") &&
//     !code.includes("export const use")
//   ) {
//     errors.push("Hook must export a function starting with 'use'");
//   }

//   return { valid: errors.length === 0, errors, warnings };
// }

// // ==================== Auto-Fix ====================

// async function fixCode(
//   code: string,
//   review: CodeReviewResult,
//   task: CodingTask,
// ): Promise<string> {
//   const fixPrompt = `
// The following code has issues:

// <original_code>
// ${code}
// </original_code>

// <issues>
// ${review.errors.map((e) => `ERROR: ${e}`).join("\n")}
// ${review.warnings.map((w) => `WARNING: ${w}`).join("\n")}
// </issues>

// <task>
//   Path: ${task.file_path}
//   Type: ${task.type}
//   Description: ${task.description}
// </task>

// Fix all ERRORs and return ONLY the corrected code.
// `;

//   const model = grok("grok-3-mini");

//   const result = await generateText({
//     model,
//     prompt: fixPrompt,
//     temperature: 0.2,
//     maxTokens: 2000,
//   });

//   return result.text.trim();
// }

// // ==================== Import Detector ====================

// function detectImports(code: string): string[] {
//   const imports: string[] = [];
//   const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
//   let match;

//   while ((match = importRegex.exec(code)) !== null) {
//     const importPath = match[1];
//     if (!importPath.startsWith(".") && !importPath.startsWith("@/")) {
//       let packageName = importPath.split("/")[0];
//       if (packageName.startsWith("@")) {
//         packageName = importPath.split("/").slice(0, 2).join("/");
//       }
//       imports.push(packageName);
//     }
//   }

//   return [...new Set(imports)];
// }

// // ==================== Main Coding Agent ====================

// export async function CodingAgent(
//   task: CodingTask,
//   context: CodingContext,
// ): Promise<CodingOutput> {
//   console.log(`  📝 Generating: ${task.file_path}`);

//   try {
//     // Generate
//     let code = await generateCode(task, context);

//     // Clean
//     code = code.replace(/^```(?:tsx?|typescript|javascript|jsx?)\n?/gi, "");
//     code = code.replace(/\n```$/g, "");
//     code = code.trim();

//     // Validate & Fix
//     let review = await validateCode(code, task.file_path, task.type);
//     let attempts = 0;

//     while (!review.valid && attempts < 2) {
//       console.log(`    🔧 Fixing (attempt ${attempts + 1})`);
//       code = await fixCode(code, review, task);
//       code = code
//         .replace(/^```(?:tsx?|typescript|javascript|jsx?)\n?/gi, "")
//         .replace(/\n```$/g, "")
//         .trim();
//       review = await validateCode(code, task.file_path, task.type);
//       attempts++;
//     }

//     const imports = detectImports(code);
//     const usesClient =
//       code.includes("'use client'") || code.includes('"use client"');

//     if (review.valid) {
//       console.log(
//         `    ✅ Generated (${imports.length} imports, ${usesClient ? "client" : "server"})`,
//       );
//     } else {
//       console.log(`    ⚠️ Generated with warnings`);
//       review.warnings.forEach((w) => console.log(`       - ${w}`));
//     }

//     return { success: review.valid, code, review, imports, usesClient };
//   } catch (error: any) {
//     console.error(`    ❌ Failed: ${error.message}`);
//     return {
//       success: false,
//       code: "",
//       review: { valid: false, errors: [error.message], warnings: [] },
//       imports: [],
//       usesClient: false,
//     };
//   }
// }

// // ==================== Batch Generator ====================

// export async function generateAllFiles(
//   plan: { features: Array<{ name: string; tasks: CodingTask[] }> },
//   existingFiles: string[] = [],
// ): Promise<Map<string, string>> {
//   const files = new Map<string, string>();
//   const allPaths = [...existingFiles];

//   for (const feature of plan.features) {
//     console.log(`\n📦 Feature: ${feature.name}`);
//     for (const task of feature.tasks) {
//       const result = await CodingAgent(task, {
//         task,
//         existingFiles: allPaths,
//         featureName: feature.name,
//       });

//       if (result.success) {
//         files.set(task.file_path, result.code);
//         allPaths.push(task.file_path);
//       }
//     }
//   }

//   return files;
// }

// // ==================== Test ====================

// async function test() {
//   console.log("🧪 Testing Coding Agent\n");

//   // Mock plan from PlannerAgent
//   const mockPlan = {
//     features: [
//       {
//         name: "core-setup",
//         tasks: [
//           {
//             id: "core-root-layout",
//             file_path: "app/layout.tsx",
//             type: "layout" as const,
//             description: "Root layout with global styles and Tailwind CSS",
//           },
//           {
//             id: "core-home-page",
//             file_path: "app/page.tsx",
//             type: "page" as const,
//             description:
//               "Main typing test game page with timer and word display",
//           },
//         ],
//       },
//       {
//         name: "typing-engine",
//         tasks: [
//           {
//             id: "typing-use-typing",
//             file_path: "hooks/use-typing.ts",
//             type: "hook" as const,
//             description:
//               "Core typing logic: track input, calculate WPM and accuracy",
//           },
//           {
//             id: "typing-word-bank",
//             file_path: "lib/words.ts",
//             type: "lib" as const,
//             description: "Word bank with common English words for typing test",
//           },
//         ],
//       },
//       {
//         name: "ui-components",
//         tasks: [
//           {
//             id: "ui-timer",
//             file_path: "components/timer.tsx",
//             type: "component" as const,
//             description: "Countdown timer component for typing test",
//           },
//           {
//             id: "ui-stats",
//             file_path: "components/stats.tsx",
//             type: "component" as const,
//             description: "Display WPM and accuracy statistics",
//           },
//         ],
//       },
//     ],
//   };

//   // Generate all files
//   const files = await generateAllFiles(mockPlan);

//   console.log("\n" + "=".repeat(60));
//   console.log("📁 Generated Files Summary");
//   console.log("=".repeat(60));

//   for (const [path, code] of files) {
//     console.log(`\n📄 ${path}`);
//     console.log("-".repeat(40));
//     console.log(
//       code.slice(0, 500) + (code.length > 500 ? "\n... (truncated)" : ""),
//     );
//   }

//   console.log("\n✅ Test complete!");
//   console.log(
//     `📊 Total files generated: ${files.size}/${mockPlan.features.flatMap((f) => f.tasks).length}`,
//   );
// }

// // Run test
// test();

// // export { test };

import { generateText } from "ai";
import { CODE_GENERATION_PROMPT } from "./prompts.ts";
import { grok } from "../models/grok.ts";

// ==================== Types ====================

interface CodingTask {
  id: string;
  file_path: string;
  type: "page" | "component" | "api" | "lib" | "hook" | "layout";
  description: string;
}

interface CodingContext {
  task: CodingTask;
  existingFiles: string[];
  generatedFileContents: Map<string, string>;
  featureName: string;
}

interface CodeReviewResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface CodingOutput {
  success: boolean;
  code: string;
  review: CodeReviewResult;
  imports: string[];
  usesClient: boolean;
}

// ==================== Prompt Builder ====================

function buildGenerationPrompt(
  task: CodingTask,
  context: CodingContext,
): string {
  const relevantExports = Array.from(context.generatedFileContents.entries())
    .filter(
      ([path]) =>
        path.startsWith("lib/") ||
        path.startsWith("hooks/") ||
        path.startsWith("app/"),
    )
    .map(([path, code]) => {
      const exportLines = code
        .split("\n")
        .filter(
          (line) =>
            line.startsWith("export") ||
            line.startsWith("interface") ||
            line.startsWith("type "),
        )
        .join("\n");

      return `<file path="${path}">\n${exportLines}\n</file>`;
    })
    .join("\n");

  return `
<task>
  <id>${task.id}</id>
  <file_path>${task.file_path}</file_path>
  <type>${task.type}</type>
  <description>${task.description}</description>
  <feature>${context.featureName}</feature>
</task>

<existing_files>
${
  context.existingFiles.length > 0
    ? context.existingFiles.map((f) => `  - ${f}`).join("\n")
    : "  (none - this is the first file)"
}
</existing_files>

${
  relevantExports
    ? `<generated_file_exports>
CRITICAL: These are the EXACT exports from already-generated files.
Only import what is listed here — do NOT guess or invent exports.
${relevantExports}
</generated_file_exports>`
    : ""
}

Generate the complete file content. Return ONLY the code, no explanations.
`.trim();
}

function buildFixPrompt(
  code: string,
  review: CodeReviewResult,
  task: CodingTask,
): string {
  return `
The following code has issues that must be fixed:

<original_code>
${code}
</original_code>

<issues>
${review.errors.map((e) => `ERROR: ${e}`).join("\n")}
${review.warnings.map((w) => `WARNING: ${w}`).join("\n")}
</issues>

<task>
  Path: ${task.file_path}
  Type: ${task.type}
  Description: ${task.description}
</task>

Fix all ERRORs and return ONLY the corrected code. No explanations.
`.trim();
}

// ==================== Code Cleaner ====================

function cleanCode(code: string): string {
  return code
    .replace(/^```(?:tsx?|typescript|javascript|jsx?)\n?/gi, "")
    .replace(/\n```$/g, "")
    .trim();
}

// ==================== Validator ====================

function validateCode(code: string, type: string): CodeReviewResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const hasHooks = /use(State|Effect|Context|Reducer|Callback|Memo|Ref)\(/.test(
    code,
  );
  const hasUseClient =
    code.includes("'use client'") || code.includes('"use client"');

  if (
    hasHooks &&
    !hasUseClient &&
    ["component", "hook", "page"].includes(type)
  ) {
    warnings.push("Uses React hooks but missing 'use client' directive");
  }

  if (["page", "layout"].includes(type) && !code.includes("export default")) {
    errors.push(`${type} must have a default export`);
  }

  if (code.includes("shadcn/") && !code.includes("@/components/ui/")) {
    errors.push("Use '@/components/ui/' for shadcn imports, not 'shadcn/'");
  }

  if (type === "layout" && !code.includes("React.ReactNode")) {
    errors.push("Layout must accept children prop typed as React.ReactNode");
  }

  if (
    type === "hook" &&
    !code.includes("export function use") &&
    !code.includes("export const use")
  ) {
    errors.push("Hook must export a function starting with 'use'");
  }

  if (code.includes(": any")) {
    warnings.push("Avoid using 'any' type - use proper types");
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ==================== Import Detector ====================

function detectImports(code: string): string[] {
  const imports: string[] = [];
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(code)) !== null) {
    const importPath = match[1];
    if (!importPath.startsWith(".") && !importPath.startsWith("@/")) {
      let packageName = importPath.split("/")[0];
      if (packageName.startsWith("@")) {
        packageName = importPath.split("/").slice(0, 2).join("/");
      }
      imports.push(packageName);
    }
  }

  return [...new Set(imports)];
}

// ==================== Code Generator ====================

async function generateCode(
  task: CodingTask,
  context: CodingContext,
): Promise<string> {
  const model = grok("grok-3-mini");

  const result = await generateText({
    model,
    system: CODE_GENERATION_PROMPT,
    prompt: buildGenerationPrompt(task, context),
    temperature: 0.04,
    maxTokens: 2000,
  });

  return cleanCode(result.text);
}

// ==================== Code Fixer ====================

async function fixCode(
  code: string,
  review: CodeReviewResult,
  task: CodingTask,
): Promise<string> {
  const model = grok("grok-3-mini");

  const result = await generateText({
    model,
    prompt: buildFixPrompt(code, review, task),
    temperature: 0.2,
    maxTokens: 2000,
  });

  return cleanCode(result.text);
}

// ==================== Coding Agent ====================

export async function CodingAgent(
  task: CodingTask,
  context: CodingContext,
): Promise<CodingOutput> {
  console.log(`  📝 Generating: ${task.file_path}`);

  try {
    let code = await generateCode(task, context);
    let review = validateCode(code, task.type);
    let attempts = 0;

    while (!review.valid && attempts < 2) {
      console.log(`    🔧 Fixing (attempt ${attempts + 1})`);
      code = await fixCode(code, review, task);
      review = validateCode(code, task.type);
      attempts++;
    }

    const imports = detectImports(code);
    const usesClient =
      code.includes("'use client'") || code.includes('"use client"');

    if (review.valid) {
      console.log(
        `    ✅ Generated (${imports.length} imports, ${usesClient ? "client" : "server"})`,
      );
    } else {
      console.log(`    ⚠️ Generated with warnings`);
      review.warnings.forEach((w) => console.log(`       - ${w}`));
    }

    return { success: review.valid, code, review, imports, usesClient };
  } catch (error: any) {
    console.error(`    ❌ Failed: ${error.message}`);
    return {
      success: false,
      code: "",
      review: { valid: false, errors: [error.message], warnings: [] },
      imports: [],
      usesClient: false,
    };
  }
}

// ==================== Batch Generator ====================

export async function generateAllFiles(
  plan: { features: Array<{ name: string; tasks: CodingTask[] }> },
  existingFiles: string[] = [],
): Promise<Map<string, string>> {
  const files = new Map<string, string>();
  const allPaths = [...existingFiles];

  for (const feature of plan.features) {
    console.log(`\n📦 Feature: ${feature.name}`);

    for (const task of feature.tasks) {
      const result = await CodingAgent(task, {
        task,
        existingFiles: allPaths,
        generatedFileContents: files, // ← exact exports passed as context
        featureName: feature.name,
      });

      if (result.success) {
        files.set(task.file_path, result.code);
        allPaths.push(task.file_path);
      }
    }
  }

  return files;
}

// ==================== Test ====================

// async function test() {
//   console.log("🧪 Testing Coding Agent\n");

//   const mockPlan = {
//     features: [
//       {
//         name: "core-setup",
//         tasks: [
//           {
//             id: "core-root-layout",
//             file_path: "app/layout.tsx",
//             type: "layout" as const,
//             description: "Root layout with global styles and Tailwind CSS",
//           },
//           {
//             id: "core-home-page",
//             file_path: "app/page.tsx",
//             type: "page" as const,
//             description: "Main typing test page with timer and word display",
//           },
//         ],
//       },
//       {
//         name: "typing-engine",
//         tasks: [
//           {
//             id: "typing-engine-lib",
//             file_path: "lib/typing-engine.ts",
//             type: "lib" as const,
//             description:
//               "Core typing logic: WPM calculation, accuracy, word generation",
//           },
//           {
//             id: "typing-use-typing",
//             file_path: "hooks/use-typing.ts",
//             type: "hook" as const,
//             description:
//               "React hook to manage typing state using lib/typing-engine.ts",
//           },
//           {
//             id: "typing-word-bank",
//             file_path: "lib/words.ts",
//             type: "lib" as const,
//             description: "Word bank with common English words for typing test",
//           },
//         ],
//       },
//       {
//         name: "ui-components",
//         tasks: [
//           {
//             id: "ui-timer",
//             file_path: "components/timer.tsx",
//             type: "component" as const,
//             description: "Countdown timer component for typing test",
//           },
//           {
//             id: "ui-stats",
//             file_path: "components/stats.tsx",
//             type: "component" as const,
//             description: "Display WPM and accuracy statistics",
//           },
//         ],
//       },
//     ],
//   };

//   const files = await generateAllFiles(mockPlan);

//   console.log("\n" + "=".repeat(60));
//   console.log("📁 Generated Files Summary");
//   console.log("=".repeat(60));

//   for (const [path, code] of files) {
//     console.log(`\n📄 ${path}`);
//     console.log("-".repeat(40));
//     console.log(
//       code.slice(0, 500) + (code.length > 500 ? "\n... (truncated)" : ""),
//     );
//   }

//   console.log("\n✅ Test complete!");
//   console.log(
//     `📊 Total files generated: ${files.size}/${mockPlan.features.flatMap((f) => f.tasks).length}`,
//   );
// }

// test();
