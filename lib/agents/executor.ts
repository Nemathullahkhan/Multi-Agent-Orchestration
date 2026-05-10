import { Sandbox } from "e2b";
import { writeTool } from "./tools/writeFIle";

interface GeneratedFile {
  path: string;
  code: string;
}

interface GeneratedCode {
  files: GeneratedFile[];
}

export async function ExecutorAgent({
  sandboxId,
  generatedCode,
}: {
  sandboxId: string;
  generatedCode: GeneratedCode;
}) {
  /**
   * Approach
   *  - It takes the files (filtered generated code) based on the paths , we'll write or (create) fileContent
   *  - It has two Flags one for the written code in the sandbox and run the sandbox
//   *  - Sandbox - will be created in the planner 0r coding Agent to improve the performance
/  */

  try {
    const sandbox = await Sandbox.connect(sandboxId);

    // 1. Ensure lib/utils.ts exists (shadcn dependency)
    const utilsExists = await sandbox.files.exists("/home/user/lib/utils.ts");
    if (!utilsExists) {
      console.log("⚠️ lib/utils.ts missing, creating it...");
      await sandbox.files.write(
        "/home/user/lib/utils.ts",
        `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
      );
    }

    // write the files
    for (const file of generatedCode.files) {
      await writeTool({
        sandboxId,
        code: file.code,
        path: file.path,
      });

      console.log(`✅ Written: ${file.path}`);
    }

    await sandbox.commands.run("npm run dev", {
      cwd: "/home/user",
      background: true,
      timeoutMs: 1_600_000,
    });

    const previewUrl = `https://${sandbox.getHost(3000)}`;

    return {
      sandboxId,
      previewUrl,
    };
  } catch (error) {
    console.log("Failed at Executor Agent", error);
  }
}
