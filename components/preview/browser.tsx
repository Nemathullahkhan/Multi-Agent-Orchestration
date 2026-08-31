import { FrameIcon, RefreshCcw } from "lucide-react";
import { useRef } from "react";
/**
 *
 * PREPArE - What is Forward Ref?
 */
interface BrowserProps {
  sandboxUrl: string;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith("http");
  } catch {
    return false;
  }
}

export default function Browser({ sandboxUrl }: BrowserProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasValidUrl = isValidUrl(sandboxUrl);

  const reloadIframe = () => {
    if (!iframeRef.current || !hasValidUrl) return;

    const url = new URL(sandboxUrl);
    url.searchParams.set("_t", Date.now().toString());
    iframeRef.current.src = url.toString();
  };

  const allowFullScreen = () => {
    if (!hasValidUrl) return;
    window.open(sandboxUrl, "_blank");
  };

  return (
    <div className="w-full">
      {/* Header with refresh button, url link, expand to full screen option  */}
      <div className="bg-zinc-600 rounded-md px-2 flex items-center">
        <button
          onClick={reloadIframe}
          disabled={!hasValidUrl}
          className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-full shadow-lg transition-colors"
          title="Reload iframe"
        >
          <RefreshCcw className="w-4 h-3 text-white" />
        </button>
        {/* search bar */}
        <div className="w-full rounded-2xl bg-zinc-900">
          <p className="font-semibold text-zinc-100 p-2">{sandboxUrl}</p>
        </div>
        {/* Allow full screen button */}
        <button
          onClick={allowFullScreen}
          disabled={!hasValidUrl}
          className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-full shadow-lg transition-colors"
          title="Open in new tab"
        >
          <FrameIcon className="w-4 h-3 text-white" />
        </button>
      </div>
      {hasValidUrl ? (
        <iframe
          ref={iframeRef}
          src={sandboxUrl}
          className="w-full h-[650px] border rounded"
          title="Sandbox Preview"
        />
      ) : (
        <div className="w-full h-[650px] border rounded flex items-center justify-center bg-zinc-900 text-zinc-400">
          Preview will appear here once the sandbox is ready
        </div>
      )}
    </div>
  );
}
