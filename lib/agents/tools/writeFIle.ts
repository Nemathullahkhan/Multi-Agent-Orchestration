/**
 *
 */

import { grok } from "@/lib/models/grok";
import { generateText } from "ai";
import { Sandbox } from "e2b";

const model = grok("grok-3-mini");

export default async function writeFile() {
  try {
    const sandbox = await Sandbox.create();

    const result = await generateText({
      model,
      prompt: "Write Hello World Program in js",
    });
    const file = await sandbox.commands.run("touch /home/user/test.js");
    console.log("FIle created");
    await sandbox.files.write("/home/user/test.js", result.text.trim());

    console.log(file);
  } catch (error) {
    console.log("FILE ERROR ", error);
  }
}

export async function writeTool({
  sandboxId,
  path,
  code,
}: {
  sandboxId: string;
  path: string;
  code: string;
}) {
  try {
    const sandbox = await Sandbox.connect(sandboxId);

    // const file = await sandbox.commands.run(`touch ${path}`);

    console.log("FIle created");
    const file = await sandbox.files.write(path, code);

    console.log(file);
  } catch (error) {
    console.log("FILE ERROR ", error);
  }
}

writeFile();
