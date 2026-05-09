"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { getFilesWithContent, startSandboxAction } from "@/lib/sandbox/actions";
import PreviewComponent from "@/components/preview";

interface FileInfo {
  name: string;
  type: string;
  path: string;
  size: number;
  mode: string;
  permissions: string;
  owner: string;
  group: string;
  modifiedTime: string;
}

export default function Page() {
  const [sandboxUrl, setSandboxUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [files, setFiles] = React.useState<FileInfo[]>([]);

  const [sandboxId, setSandboxId] = useState<string>("");

  async function handleCreateSandbox() {
    setIsLoading(true);
    try {
      const { previewUrl, sandboxId } = await startSandboxAction();
      setSandboxId(sandboxId);
      setSandboxUrl(previewUrl);
    } catch (error) {
      console.error("Failed to create sandbox:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadFilesWithContent() {
    setIsLoading(true);
    try {
      const filesMap = await getFilesWithContent(sandboxId);
      // Convert Record<string, string> to FileInfo[]
      const filesArray: FileInfo[] = Object.keys(filesMap).map((filePath) => ({
        name: filePath.split("/").pop() || filePath,
        type: "file",
        path: filePath,
        size: filesMap[filePath].length,
        mode: "unknown",
        permissions: "unknown",
        owner: "unknown",
        group: "unknown",
        modifiedTime: new Date().toISOString(),
      }));

      setFiles(filesArray);
    } catch (error) {
      console.error("Failed to load sandbox files", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sandbox</h1>

      <Button onClick={handleCreateSandbox} disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Sandbox"}
      </Button>
      <Button onClick={loadFilesWithContent} disabled={isLoading}>
        {isLoading ? "Creating..." : "Load Files"}
      </Button>

      {sandboxUrl && (
        <div className="mt-6 relative">
          <div className="absolute top-2 right-2 z-10"></div>

          <PreviewComponent sandboxUrl={sandboxUrl} />

          {/* File List Section */}
          {files.length > 0 && (
            <div className="mt-4 p-4 border rounded bg-zinc-900 text-white">
              <h3 className="text-lg font-semibold mb-2">
                Files ({files.length})
              </h3>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {files.slice(0, 10).map((file, index) => (
                  <div
                    key={index}
                    className="p-2 border border-zinc-700 rounded text-sm"
                  >
                    <div className="font-mono">
                      <span className="text-blue-400">{file.name}</span>
                      <span className="text-zinc-500 ml-2">({file.type})</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">
                      Path: {file.path} | Size: {file.size} bytes
                    </div>
                  </div>
                ))}
                {files.length > 10 && (
                  <div className="text-center text-zinc-500 text-sm">
                    + {files.length - 10} more files
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
