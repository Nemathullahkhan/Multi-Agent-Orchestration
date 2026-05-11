"use client";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Bot } from "lucide-react";

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  const user = session?.user;

  {
    /* - Input box 
                1. call the new/project api route 
                2. Route to chat/[project-ID]
                3. call the api/agent/run
          */
  }
  const [userQuery, setUserQuery] = useState<string | null>(null);
  function handleSubmit() {
    console.log("User Query:", userQuery);

    const createProject = async () => {
      const response = await axios.post("/api/project", {
        userId: user?.id,
        name: "New Project from dashboard",
        initialPrompt: userQuery,
      });
      console.log(response);
      const result = response.data.data;
      console.log("Project created:", result.id);
      router.push(`/chat/${result.id}`);
    };
    createProject();
  }

  return (
    <div className="bg-stone-100 w-full flex flex-col items-center min-h-screen">
      <Container className="px-4 bg-stone-50 flex-col  py-16 min-h-screen w-full">
        <div className="flex justify-center w-full p-2 rounded-sm">
          <div className="flex flex-col gap-1 justify-center items-center bg-primary px-10 rounded-lg py-4 ">
            <Bot size={128} className="text-neutral-50" />
            <h1 className="text-4xl font-mono text-neutral-50">MAO</h1>
          </div>
        </div>
        <div className="flex-col justify-center items-center space-y-10">
          <div className="flex justify-center pt-20">
            <h1 className="type-h1">
              {" "}
              Welcome,{" "}
              <span className="serif-accent tracking-tighter">
                {user?.name}
              </span>
            </h1>
          </div>
          <div className="max-w-4xl mx-auto w-full">
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-zinc-700 to-zinc-500 opacity-20 blur group-focus-within:opacity-60 transition duration-300" />

              <div className="relative flex items-center rounded-3xl border border-zinc-800 bg-zinc-900 px-5 py-5 shadow-xl transition-all duration-300 group-focus-within:border-zinc-600">
                <Input
                  placeholder="Describe the project you want to build..."
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="h-24 border-none bg-transparent text-2xl text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 "
                />

                <Button
                  onClick={handleSubmit}
                  className="absolute right-5 top-1/2 -translate-y-1/2 h-12 rounded-xl bg-white px-6 text-sm font-medium text-black hover:bg-zinc-200 transition"
                >
                  New Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
