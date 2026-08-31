/**
 *
 */

import { sandbox } from "@/lib/sandbox/sandbox";

export async function readFile() {
  try {
    // const file = await sandbox.commands.run("touch /home/user/test.js");
    // console.log("FIle created");


    const result = await sandbox.commands.run(
      'find /home/user -maxdepth 3 -not -path "*/node_modules/*"',
    );

    // filter the results and divide into paths,

    console.log(result);

    // read teh files content
    console.time("read");
    const fileContent = await sandbox.files.read("/home/user/app/page.tsx");
    console.timeEnd("read");
    console.log("fileContent - ", fileContent);
    return result;
  } catch (error) {
    console.log("FILE ERROR ", error);
  }
}

export async function readFiles() {
  try {
    const result = await sandbox.commands.run(
      `find /home/user \
      -maxdepth 3 \
      -type f \
      -not -path "*/node_modules/*"`,
    );

    // Convert stdout into array
    const paths = result.stdout
      .split("\n")
      .map((path) => path.trim())
      .filter(Boolean);

    console.log("PATHS => ", paths);

    // Read files one by one
    for (const path of paths) {
      try {
        console.log("\n====================");
        console.log("READING:", path);
        console.time(path);
        await sandbox.files.read(path);
        console.timeEnd(path);
      } catch {
        console.log("ERROR READING:", path);
      }
    }

    return paths;
  } catch (error) {
    console.log("FILE ERROR ", error);
  }
}
