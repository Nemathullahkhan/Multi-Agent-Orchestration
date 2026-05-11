import { FrameIcon, RefreshCcw } from "lucide-react";
import { useRef } from "react";
/**
 *
 * PREPArE - What is Forward Ref?
 */
interface BrowserProps {
  sandboxUrl: string;
}

export default function Browser({ sandboxUrl }: BrowserProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const reloadIframe = () => {
    console.log("CLICK on reload");
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      const url = new URL(currentSrc);
      url.searchParams.set("_t", Date.now().toString());
      iframeRef.current.src = url.toString();
      console.log("Inside ");
    }
    console.log("Outside");
  };

  const allowFullScreen = () => {
    window.open(sandboxUrl, "_blank");
    // PREPARE - blank allows to open this link in a new tab or new indow
  };

  return (
    <div>
      {/* Header with refresh button, url link, expand to full screen option  */}
      <div className="bg-zinc-600 rounded-md px-2 flex items-center">
        <button
          onClick={reloadIframe}
          className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full shadow-lg transition-colors"
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
          className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full shadow-lg transition-colors"
          title="Reload iframe"
        >
          <FrameIcon className="w-4 h-3 text-white" />
        </button>
      </div>
      <iframe
        ref={iframeRef}
        src={sandboxUrl}
        className="w-full h-[600px] border rounded"
        title="Sandbox Preview"
      />
    </div>
  );
}
