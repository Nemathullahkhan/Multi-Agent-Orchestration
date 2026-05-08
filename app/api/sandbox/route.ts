"use server";

import { Sandbox } from "e2b";

/**
 * PREPARE _ What is TranformStream?
 */
export async function GET() {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const sandbox = await Sandbox.create("nextjs-template");

  const previewUrl = `https://${sandbox.getHost(3000)}`;

  await writer.write(
    encoder.encode(
      JSON.stringify({
        type: "url",
        data: previewUrl,
      }) + "\n",
    ),
  );

  const terminal = await sandbox.pty.create({
    cols: 80,
    rows: 24,
    timeoutMs: 0,

    onData: async (data) => {
      await writer.write(
        encoder.encode(
          JSON.stringify({
            type: "terminal",
            data,
          }) + "\n",
        ),
      );
    },
  });

  await sandbox.pty.sendInput(terminal.pid, encoder.encode("npm run dev\n"));

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
