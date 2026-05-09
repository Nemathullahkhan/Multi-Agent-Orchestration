// lib/sandbox/actions.ts
"use server";

export async function startSandboxAction() {
  const { Sandbox } = await import("e2b");

  // Set timeout to 0 for infinite timeout
  const sandbox = await Sandbox.create(
    "nextjs-template",
    //   ,
    //   {
    //   timeoutMs: 3600000, // 0 = infinite timeout
    // }
  );

  const previewUrl = `https://${sandbox.getHost(3000)}`;
  const sandboxId = sandbox.sandboxId;

  sandbox.commands.run("npm run dev", {
    background: true,
  });

  console.log("Sandbox created with infinite timeout:", sandboxId);

  return { previewUrl, sandboxId };
}

export async function getFilesWithContent(
  sandboxId: string,
  path: string = "/home/user",
  depth: number = 3,
) {
  const { Sandbox } = await import("e2b");

  // Connect with infinite timeout
  const sandbox = await Sandbox.connect(sandboxId, {});

  const filesMap: Record<string, string> = {};

  try {
    const files = await sandbox.files.list(path, { depth });

    for (const file of files) {
      if (file.type === "file") {
        try {
          const content = await sandbox.files.read(file.path);
          const relativePath = file.path.replace("/home/user/", "");
          filesMap[relativePath] = content;
        } catch (error) {
          console.error(`Failed to read ${file.path}:`, error);
          filesMap[file.path] = `Error reading file: ${error}`;
        }
      }
    }

    return filesMap;
  } catch (error) {
    console.error("Failed to get files with content:", error);
    return {};
  }
}
