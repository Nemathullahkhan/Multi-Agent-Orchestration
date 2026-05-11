"use client";

import Container from "@/components/container";
import PreviewComponent from "@/components/preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Bot, Loader } from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Chat() {
  const { projectId } = useParams();
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [userQuery, setUserQuery] = useState<string | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const hasStartedRef = useRef(false);

  useEffect(() => {
    const startOrchestrator = async () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;

      try {
        setLoading(true);

        const projectResponse = await axios.get(
          `/api/project?projectId=${projectId}`,
        );
        const projectData = projectResponse.data.data;
        console.log("Project Data:", projectData);

        const response = await axios.post("/api/agent/run", {
          userQuery: projectData.initialPrompt,
        });

        const { sandboxId, previewUrl } = response.data;
        setPreviewUrl(previewUrl);
        setSandboxId(sandboxId);
      } catch (error) {
        console.log("Error at the orchestrator", error);
      } finally {
        setLoading(false);
      }
    };

    startOrchestrator();
  }, [projectId]);

  /**
   * Chat Page:
   * - Input box for user queries
   * - On submit, send query to backend API route (api/agent/run)
   * - Display response from agent in chat interface
   * - Show loading state while waiting for response
   * - Handle errors gracefully
   */
  return (
    <>
      {/* Navbar */}
      <div className="w-full bg-stone-100 ">
        <Container className={cn("flex items-center justify-between p-4")}>
          <Button
            className="flex gap-2 items-center bg-primary p-2 rounded-sm"
            onClick={() => {
              router.push("/");
            }}
          >
            <Bot size={32} className="text-zinc-50" />
            <h1 className="text-2xl font-bold tracking-tight font-mono text-zinc-50">
              MAO
            </h1>
          </Button>
        </Container>
      </div>

      <div className="px-12 grid grid-cols-[30%_70%] gap-2">
        <div className="flex flex-col justify-between border-2 border-black p-2 pb-4">
          <h1 className="text-3xl font-semibold tracking-tighter">Chat</h1>

          {/* TODO - Response Div  */}

          <div className="bottom-0 bg-neutral-100 relative p-2">
            <Input
              className="text-lg h-12  rounded-md border-none"
              onChange={(e) => {
                e.preventDefault();
                setUserQuery(e.target.value);
              }}
            />
            <div className="absolute right-2 bottom-3">
              <Button className="rounded-sm h-9 w-9">{">"}</Button>
            </div>
          </div>
        </div>

        <div className="w-full h-[750px]  border-2 border-neutral-800 rounded-sm ">
          <div className="flex w-full h-full justify-center border-2 rounded-sm border-red-500">
            {!isLoading ? (
              <PreviewComponent sandboxUrl={previewUrl} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader className="animate-spin bg-green-400" />
                <p>Loading</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
