import { Sandbox } from "e2b";
import dotenv from "dotenv";
dotenv.config();

export const sandbox = await Sandbox.create("nextjs-template");

async function testSandbox() {
  await sandbox.files.write("/home/user/hello.txt", "Hello, Sandbox!");

  const check = await sandbox.commands.run(
    "ls /home/user && echo '---' && ls /home/user/node_modules | grep -E 'tailwind-merge|clsx'",
    { cwd: "/home/user", timeoutMs: 10_000 },
  );
  console.log("🔍 Sandbox check:", check.stdout);
}

testSandbox();
