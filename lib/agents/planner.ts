// // Version - 1
// // import { generateText, Output } from "ai";
// // import { z } from "zod";
// // import { mistral } from "../mistral.ts";
// // import { NEXTJS_CONVENTIONS } from "./utils.ts";
// // import { PLANNER_SYSTEM_PROMPT } from "./prompts.ts";

// // const TaskSchema = z.object({
// //   id: z.string(),
// //   description: z.string().min(1),
// //   file_path: z.string().min(1),
// //   type: z.enum(["component", "page", "api", "config", "lib", "hook", "layout"]),
// //   dependencies: z.array(z.string()),
// //   estimated_complexity: z.number().min(1).max(10),
// //   required_context: z.array(z.string()),
// //   feature: z.string(),
// // });

// // const FeatureSchema = z.object({
// //   name: z.string().min(1),
// //   description: z.string().min(1),
// //   tasks: z.array(TaskSchema),
// //   priority: z.enum(["high", "medium", "low"]),
// //   can_parallelize_with: z.array(z.string()),
// // });

// // const DevelopmentPlanSchema = z.object({
// //   features: z.array(FeatureSchema).min(1),
// //   feature_execution_order: z.array(z.array(z.string().optional())),
// // });

// // type DevelopmentPlan = z.infer<typeof DevelopmentPlanSchema>;

// // export async function PlannerAgent(
// //   userQuery: string,
// // ): Promise<DevelopmentPlan> {
// //   try {
// //     const userPrompt = `
// //       User request: "${userQuery}"

// //       <project_conventions>
// //       ${NEXTJS_CONVENTIONS}
// //       </project_conventions>

// //       Generate a complete development plan.
// //       Each task must have a unique id like "feat-name-filename" (kebab-case).
// //     `;

// //     const model = mistral("mistral-large-latest");

// //     const result = await generateText({
// //       model,
// //       system: PLANNER_SYSTEM_PROMPT,
// //       prompt: userPrompt,
// //       output: Output.object({
// //         schema: DevelopmentPlanSchema,
// //       }),
// //       temperature: 0.2,
// //     });

// //     if (!result.output) {
// //       throw new Error("Model returned null output");
// //     }

// //     const plan = DevelopmentPlanSchema.parse(result.output);

// //     console.log("Generated Development Plan:", JSON.stringify(plan, null, 2));
// //     return plan;
// //   } catch (error: unknown) {
// //     if (error instanceof Error) {
// //       console.error("Failed to generate plan:", error.message);
// //     }

// //     throw new Error("PlannerAgent failed");
// //   }
// // }

// // PlannerAgent("Build me pomodoro application simple spa application");

// // PREPARE - Retry logic, validation function

// import { generateText, Output } from "ai";
// import { z } from "zod";
// import { mistral } from "../models/mistral.ts";
// import { PLANNER_SYSTEM_PROMPT_COMPRESSED } from "./prompts.ts";

// // ==================== Schemas ====================

// const TaskSchema = z.object({
//   id: z.string(),
//   file_path: z.string().min(1),
//   type: z.enum(["page", "component", "api", "lib", "hook", "layout"]),
//   description: z.string().max(200),
//   dependencies: z.array(z.string()).optional(),
// });

// const FeatureSchema = z.object({
//   name: z.string().max(50),
//   priority: z.enum(["critical", "high", "medium", "low"]),
//   tasks: z.array(TaskSchema).max(10),
// });

// const DevelopmentPlanSchema = z.object({
//   features: z.array(FeatureSchema).max(8),
//   total_files: z.number(),
// });

// type DevelopmentPlan = z.infer<typeof DevelopmentPlanSchema>;

// // ==================== Prompt Builder ====================

// function buildPrompt(userQuery: string, existingFiles: string[]): string {
//   const sections = [`<query>${userQuery}</query>`];

//   if (existingFiles.length > 0) {
//     const files = existingFiles
//       .slice(0, 15)
//       .map((f) => f.split("/").pop())
//       .join(", ");
//     sections.push(`<existing>${files}</existing>`);
//   }

//   return sections.join("\n");
// }

// // ==================== Validator (Simple & Fast) ====================

// interface ValidationResult {
//   valid: boolean;
//   errors: string[];
//   warnings: string[];
//   fixedPlan: DevelopmentPlan;
// }

// function validateAndFix(plan: DevelopmentPlan): ValidationResult {
//   const errors: string[] = [];
//   const warnings: string[] = [];
//   const taskMap = new Map<string, any>();
//   const filePaths = new Set<string>();

//   // Build maps
//   for (const feature of plan.features) {
//     for (const task of feature.tasks) {
//       if (filePaths.has(task.file_path)) {
//         errors.push(`Duplicate file: ${task.file_path}`);
//       }
//       filePaths.add(task.file_path);
//       taskMap.set(task.id, task);
//     }
//   }

//   // Check dependencies
//   for (const feature of plan.features) {
//     for (const task of feature.tasks) {
//       for (const dep of task.dependencies || []) {
//         if (!taskMap.has(dep)) {
//           errors.push(`Task "${task.id}" depends on missing task: "${dep}"`);
//         }
//       }
//     }
//   }

//   // Quick cycle detection
//   function hasCycle(): boolean {
//     const visited = new Set<string>();
//     const stack = new Set<string>();

//     function dfs(id: string): boolean {
//       if (stack.has(id)) return true;
//       if (visited.has(id)) return false;

//       visited.add(id);
//       stack.add(id);

//       const task = taskMap.get(id);
//       for (const dep of task?.dependencies || []) {
//         if (dfs(dep)) return true;
//       }

//       stack.delete(id);
//       return false;
//     }

//     for (const id of taskMap.keys()) {
//       if (dfs(id)) return true;
//     }
//     return false;
//   }

//   if (hasCycle()) {
//     errors.push("Circular dependencies detected");
//   }

//   // Fix paths (remove leading slashes)
//   for (const feature of plan.features) {
//     for (const task of feature.tasks) {
//       if (task.file_path.startsWith("/")) {
//         task.file_path = task.file_path.slice(1);
//         warnings.push(`Fixed path: ${task.file_path}`);
//       }
//     }
//   }

//   // Fix total_files if mismatch
//   if (plan.total_files !== filePaths.size) {
//     plan.total_files = filePaths.size;
//     warnings.push(
//       `Adjusted total_files from ${plan.total_files} to ${filePaths.size}`,
//     );
//   }

//   return {
//     valid: errors.length === 0,
//     errors,
//     warnings,
//     fixedPlan: plan,
//   };
// }

// export async function PlannerAgent(
//   userQuery: string,
//   options?: {
//     existingFiles?: string[];
//     maxFeatures?: number;
//     detailLevel?: "minimal" | "standard";
//   },
// ): Promise<DevelopmentPlan> {
//   const startTime = Date.now();
//   const maxFeatures = options?.maxFeatures ?? 2;
//   const detailLevel = options?.detailLevel ?? "standard";
//   const existingFiles = options?.existingFiles ?? [];

//   console.log(`🤖 Planning: ${detailLevel} mode, max ${maxFeatures} features`);
//   console.log(`📁 ${existingFiles.length} existing files`);

//   const model = mistral("mistral-large-latest");
//   const userPrompt = buildPrompt(userQuery, existingFiles);

//   for (let attempt = 1; attempt <= 2; attempt++) {
//     try {
//       console.log(`📝 Attempt ${attempt}/2...`);

//       const result = await generateText({
//         model,
//         system: PLANNER_SYSTEM_PROMPT_COMPRESSED,
//         prompt: userPrompt,
//         output: Output.object({ schema: DevelopmentPlanSchema }),
//         temperature: 0.04,
//         maxTokens: detailLevel === "minimal" ? 1000 : 2000,
//       });

//       if (!result.output) {
//         throw new Error("No output from model");
//       }

//       let plan = DevelopmentPlanSchema.parse(result.output);

//       // Validate and fix
//       const validation = validateAndFix(plan);
//       plan = validation.fixedPlan;

//       if (!validation.valid) {
//         console.error(`❌ Validation failed: ${validation.errors.join(", ")}`);
//         if (attempt === 2) {
//           throw new Error(`Invalid plan: ${validation.errors.join(", ")}`);
//         }
//         continue;
//       }

//       if (validation.warnings.length > 0) {
//         console.warn(`⚠️ ${validation.warnings.length} warnings fixed`);
//       }

//       // Log success
//       const duration = Date.now() - startTime;
//       console.log(
//         `✅ Plan ready: ${plan.features.length} features, ${plan.total_files} files`,
//       );
//       console.log(`⏱️ ${duration}ms`);

//       plan.features.forEach((f, i) => {
//         console.log(
//           `   ${i + 1}. [${f.priority}] ${f.name} — ${f.tasks.length} files`,
//         );
//       });

//       console.log(JSON.stringify(plan, null, 2));

//       return {
//         plan,
//         plan.
//       }
//     } catch (error: any) {
//       console.error(`❌ Attempt ${attempt} failed: ${error.message}`);
//       if (attempt === 2) throw error;
//       await new Promise((r) => setTimeout(r, 1000));
//     }
//   }

//   throw new Error("PlannerAgent failed");
// }

// // ==================== Test ====================

// // PlannerAgent(
// //   "Build me typing website application just like monkeytype simple spa application",
// //   {
// //     detailLevel: "standard",
// //   },
// // );

import { generateText, Output } from "ai";
import { z } from "zod";
import { mistral } from "../models/mistral.ts";
import { PLANNER_SYSTEM_PROMPT_COMPRESSED } from "./prompts.ts";

// ==================== Preinstalled Packages ====================

const PREINSTALLED_PACKAGES = new Set([
  "react",
  "react-dom",
  "next",
  "tailwindcss",
  "tw-animate-css",
  "clsx",
  "tailwind-merge",
  "lucide-react",
  "class-variance-authority",
  "@radix-ui/react-accordion",
  "@radix-ui/react-alert-dialog",
  "@radix-ui/react-aspect-ratio",
  "@radix-ui/react-avatar",
  "@radix-ui/react-checkbox",
  "@radix-ui/react-collapsible",
  "@radix-ui/react-context-menu",
  "@radix-ui/react-dialog",
  "@radix-ui/react-dropdown-menu",
  "@radix-ui/react-hover-card",
  "@radix-ui/react-label",
  "@radix-ui/react-menubar",
  "@radix-ui/react-navigation-menu",
  "@radix-ui/react-popover",
  "@radix-ui/react-progress",
  "@radix-ui/react-radio-group",
  "@radix-ui/react-scroll-area",
  "@radix-ui/react-select",
  "@radix-ui/react-separator",
  "@radix-ui/react-slider",
  "@radix-ui/react-slot",
  "@radix-ui/react-switch",
  "@radix-ui/react-tabs",
  "@radix-ui/react-toast",
  "@radix-ui/react-toggle",
  "@radix-ui/react-toggle-group",
  "@radix-ui/react-tooltip",
]);

function filterMissingDependencies(requested: string[]): string[] {
  return requested.filter((dep) => {
    const name = dep.split("@")[0];
    return !PREINSTALLED_PACKAGES.has(name);
  });
}

// ==================== Schemas ====================

const TaskSchema = z.object({
  id: z.string(),
  file_path: z.string().min(1),
  type: z.enum(["page", "component", "api", "lib", "hook", "layout"]),
  description: z.string().max(200),
  dependencies: z.array(z.string()).optional(),
});

const FeatureSchema = z.object({
  name: z.string().max(50),
  priority: z.enum(["critical", "high", "medium", "low"]),
  tasks: z.array(TaskSchema).max(10),
});

const DevelopmentPlanSchema = z.object({
  features: z.array(FeatureSchema).max(8),
  total_files: z.number(),
  npm_dependencies: z.array(z.string()).default([]),
});

export type DevelopmentPlan = z.infer<typeof DevelopmentPlanSchema>;

export interface PlannerOutput {
  plan: DevelopmentPlan;
  missingDependencies: string[];
}

// ==================== Prompt Builder ====================

function buildPrompt(userQuery: string, existingFiles: string[]): string {
  const sections = [`<query>${userQuery}</query>`];

  if (existingFiles.length > 0) {
    const files = existingFiles
      .slice(0, 15)
      .map((f) => f.split("/").pop())
      .join(", ");
    sections.push(`<existing>${files}</existing>`);
  }

  return sections.join("\n");
}

// ==================== Validator ====================

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  fixedPlan: DevelopmentPlan;
}

function validateAndFix(plan: DevelopmentPlan): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const taskMap = new Map<string, any>();
  const filePaths = new Set<string>();

  // Build maps and check duplicates
  for (const feature of plan.features) {
    for (const task of feature.tasks) {
      if (filePaths.has(task.file_path)) {
        errors.push(`Duplicate file: ${task.file_path}`);
      }
      filePaths.add(task.file_path);
      taskMap.set(task.id, task);
    }
  }

  // Check task dependencies exist
  for (const feature of plan.features) {
    for (const task of feature.tasks) {
      for (const dep of task.dependencies || []) {
        if (!taskMap.has(dep)) {
          errors.push(`Task "${task.id}" depends on missing task: "${dep}"`);
        }
      }
    }
  }

  // Cycle detection
  function hasCycle(): boolean {
    const visited = new Set<string>();
    const stack = new Set<string>();

    function dfs(id: string): boolean {
      if (stack.has(id)) return true;
      if (visited.has(id)) return false;
      visited.add(id);
      stack.add(id);
      const task = taskMap.get(id);
      for (const dep of task?.dependencies || []) {
        if (dfs(dep)) return true;
      }
      stack.delete(id);
      return false;
    }

    for (const id of taskMap.keys()) {
      if (dfs(id)) return true;
    }
    return false;
  }

  if (hasCycle()) errors.push("Circular dependencies detected");

  // Fix leading slashes
  for (const feature of plan.features) {
    for (const task of feature.tasks) {
      if (task.file_path.startsWith("/")) {
        task.file_path = task.file_path.slice(1);
        warnings.push(`Fixed path: ${task.file_path}`);
      }
    }
  }

  // Fix total_files mismatch
  if (plan.total_files !== filePaths.size) {
    warnings.push(
      `Adjusted total_files from ${plan.total_files} to ${filePaths.size}`,
    );
    plan.total_files = filePaths.size;
  }

  return { valid: errors.length === 0, errors, warnings, fixedPlan: plan };
}

// ==================== Agent ====================

export async function PlannerAgent(
  userQuery: string,
  options?: {
    existingFiles?: string[];
    maxFeatures?: number;
    detailLevel?: "minimal" | "standard";
  },
): Promise<PlannerOutput> {
  const startTime = Date.now();
  const detailLevel = options?.detailLevel ?? "standard";
  const existingFiles = options?.existingFiles ?? [];

  console.log(`🤖 Planning: ${detailLevel} mode`);
  console.log(`📁 ${existingFiles.length} existing files`);

  const model = mistral("mistral-large-latest");
  const userPrompt = buildPrompt(userQuery, existingFiles);

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`📝 Attempt ${attempt}/2...`);

      const result = await generateText({
        model,
        system: PLANNER_SYSTEM_PROMPT_COMPRESSED,
        prompt: userPrompt,
        output: Output.object({ schema: DevelopmentPlanSchema }),
        temperature: 0.04,
        maxTokens: detailLevel === "minimal" ? 1000 : 2000,
      });

      if (!result.output) throw new Error("No output from model");

      let plan = DevelopmentPlanSchema.parse(result.output);

      const validation = validateAndFix(plan);
      plan = validation.fixedPlan;

      if (!validation.valid) {
        console.error(`❌ Validation failed: ${validation.errors.join(", ")}`);
        if (attempt === 2)
          throw new Error(`Invalid plan: ${validation.errors.join(", ")}`);
        continue;
      }

      if (validation.warnings.length > 0) {
        console.warn(`⚠️ ${validation.warnings.length} warnings fixed`);
      }

      const missingDependencies = filterMissingDependencies(
        plan.npm_dependencies ?? [],
      );

      const duration = Date.now() - startTime;
      console.log(
        `✅ Plan ready: ${plan.features.length} features, ${plan.total_files} files`,
      );
      console.log(`⏱️ ${duration}ms`);
      console.log(
        missingDependencies.length > 0
          ? `📦 Missing deps: ${missingDependencies.join(", ")}`
          : "✅ No new dependencies needed",
      );

      plan.features.forEach((f, i) => {
        console.log(
          `   ${i + 1}. [${f.priority}] ${f.name} — ${f.tasks.length} files`,
        );
      });

      console.log(JSON.stringify(plan, null, 2));

      return { plan, missingDependencies };
    } catch (error: any) {
      console.error(`❌ Attempt ${attempt} failed: ${error.message}`);
      if (attempt === 2) throw error;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  throw new Error("PlannerAgent failed");
}
