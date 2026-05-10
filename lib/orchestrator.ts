// import { Sandbox } from "e2b";
// import dotenv from "dotenv";
// dotenv.config();

// import { PlannerAgent } from "./agents/planner";
// import { generateAllFiles } from "./agents/coding";
// import { ExecutorAgent } from "./agents/executor";

// export default async function Orchestrator() {
//   /**
//    *  - Start the sandbox
//    *  - Call the Planner Agent
//    *  - Call the Coding  Agent
//    *  - Call the Executor Agent
//    *  - Return the previewURl and sandboxId
//    */

//   const sandbox = await Sandbox.create("nextjs-template", {
//     timeoutMs: 3_600_000,
//   });

//   const sandboxId = sandbox.sandboxId;
//   // Calling the Planner Agent
//   const plan = await PlannerAgent(
//     "Build a typing website for just like monkeyType",
//   );
//   console.log("Plan from orchestrator - ", plan);

//   const generatedFiles = await generateAllFiles(plan);

//   console.log(`✅ Generated ${generatedFiles.size} files`);

//   // TODO _ streaming of text from generatedFiles Code to our inbuilt file system

//   const files = Array.from(generatedFiles.entries()).map(([path, code]) => ({
//     path,
//     code,
//   }));

//   const execution = await ExecutorAgent({
//     sandboxId,
//     generatedCode: {
//       files,
//     },
//   });

//   console.log("Execution URL from orchestrator - ", execution?.previewUrl);
//   return {
//     sandboxId: sandbox.sandboxId,
//     previewUrl: execution?.previewUrl,
//   };
// }

// Orchestrator();

import { Sandbox } from "e2b";
import dotenv from "dotenv";
dotenv.config();

import { PlannerAgent } from "./agents/planner";
import { generateAllFiles } from "./agents/coding";
import { ExecutorAgent } from "./agents/executor";

export default async function Orchestrator(userQuery: string) {
  console.log("🚀 Starting Orchestrator...");
  console.log(`📝 Query: ${userQuery}`);

  // 1. Create sandbox
  console.log("\n🏗️  Creating sandbox...");
  const sandbox = await Sandbox.create("nextjs-template-v2", {
    timeoutMs: 60 * 60 * 1000, // 60 minutes
  });
  console.log(`✅ Sandbox created: ${sandbox.sandboxId}`);

  try {
    // 2. Plan
    console.log("\n🤖 Running Planner Agent...");
    const { plan, missingDependencies } = await PlannerAgent(userQuery);

    // 3. Install missing dependencies into sandbox
    if (missingDependencies.length > 0) {
      console.log(
        `\n📦 Installing missing dependencies: ${missingDependencies.join(", ")}`,
      );
      const installResult = await sandbox.commands.run(
        `npm install ${missingDependencies.join(" ")}`,
        {
          cwd: "/home/user",
          timeoutMs: 3 * 60 * 1000,
        },
      );

      if (installResult.exitCode !== 0) {
        console.warn(`⚠️ npm install warnings:\n${installResult.stderr}`);
      } else {
        console.log("✅ Dependencies installed successfully");
      }
    }

    // 4. Generate files
    console.log("\n⚙️  Running Coding Agent...");
    const generatedFiles = await generateAllFiles(plan);
    console.log(`✅ Generated ${generatedFiles.size} files`);

    const files = Array.from(generatedFiles.entries()).map(([path, code]) => ({
      path,
      code,
    }));

    // 5. Execute — write files + start dev server
    console.log("\n🚀 Running Executor Agent...");
    const execution = await ExecutorAgent({
      sandboxId: sandbox.sandboxId,
      generatedCode: { files },
    });

    console.log("\n✅ Orchestrator complete!");
    console.log(`🔗 Preview URL: ${execution?.previewUrl}`);
    console.log(`📦 Sandbox ID: ${sandbox.sandboxId}`);

    return {
      sandboxId: sandbox.sandboxId,
      previewUrl: execution?.previewUrl,
    };
  } catch (error) {
    console.error("❌ Orchestrator failed:", error);
    throw error;
  }
}

Orchestrator(
  "Build a typing website just like monkeyType simple 2 features - 1. Typing test page with real-time WPM and accuracy, 2. Leaderboard page showing top scores. Use Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui. Keep it minimal and clean.",
);
