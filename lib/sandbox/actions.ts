// lib/sandbox/actions.ts
"use server";

export async function startSandboxAction() {
  // Dynamic import to ensure e2b is only loaded on the server
  const { Sandbox } = await import("e2b");

  const sandbox = await Sandbox.create("nextjs-template");
  const previewUrl = `https://${sandbox.getHost(3000)}`;

  await sandbox.commands.run("npm run dev", {
    background: true,
  });

  return previewUrl;
}
