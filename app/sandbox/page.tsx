"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { startSandboxAction } from "@/lib/sandbox/actions";
import { RefreshCcw } from "lucide-react";

export default function Page() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [sandboxUrl, setSandboxUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleCreateSandbox() {
    setIsLoading(true);
    try {
      const url = await startSandboxAction();
      setSandboxUrl(url);
    } catch (error) {
      console.error("Failed to create sandbox:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const reloadIframe = () => {
    if (iframeRef.current) {
      // This works for cross-origin iframes
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sandbox</h1>

      <Button onClick={handleCreateSandbox} disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Sandbox"}
      </Button>

      {sandboxUrl && (
        <>
          <div className="mt-6 relative">
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={reloadIframe}
                className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full shadow-lg transition-colors"
                title="Reload iframe"
              >
                <RefreshCcw className="w-5 h-5 text-white" />
              </button>
            </div>
            <iframe
              ref={iframeRef}
              src={sandboxUrl}
              className="w-full h-[600px] border rounded bg-white"
              title="Sandbox Preview"
            />
          </div>
        </>
      )}
    </div>
  );
}
