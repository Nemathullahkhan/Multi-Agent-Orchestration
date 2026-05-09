import { useState } from "react";
import { Button } from "../ui/button";
import FileSystem from "./file-system";
import Browser from "./browser";

export default function PreviewComponent({
  sandboxUrl,
}: {
  sandboxUrl: string;
}) {
  const [select, setSelect] = useState<number | null>(null);

  return (
    <div className="max-w-4xl h-800px bg-zinc-950 p-2">
      <div className="w-full h-fit  text-zinc-50">
        <Button
          variant={"ghost"}
          onClick={() => setSelect(0)}
          className="rounded-sm"
        >
          {"Files"}
        </Button>
        |
        <Button
          variant={"ghost"}
          onClick={() => setSelect(1)}
          className="rounded-sm"
        >
          {"Browser"}
        </Button>
      </div>
      {/* Rendering those two sections */}
      <div className="">
        {select == 0 ? <FileSystem /> : <Browser sandboxUrl={sandboxUrl} />}
      </div>
    </div>
  );
}
