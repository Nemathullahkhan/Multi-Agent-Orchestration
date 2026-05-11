"use client";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) {
      router.push("/signin");
    }
  }, [session, router]);

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
    <div className="flex flex-col items-center  bg-zinc-900 h-screen w-full px-10 py-12">
      <button
        onClick={async () => {
          await signOut({
            fetchOptions: {
              onSuccess: () => {
                toast.message("Logged Out Successfully");
              },
            },
          });
        }}
        className="text-red-400 text-4xl"
      >
        Signout
      </button>

      <div className="bg-primary w-full flex flex-col items-center min-h-screen">
        <Container className="px-4 bg-white flex-col  py-16 min-h-screen w-full">
          <div className="flex-col justify-center items-center space-y-2">
            <div className="text-4xl font-semibold tracking-tight font-sans text-center">
              Welcome back, Mao!
            </div>
            <div className="max-w-4xl mx-auto">
              <div className=""></div>
              <Input
                className="max-w-4xl  bg-primary rounded-md h-15 text-lg text-white"
                onChange={(e) => setUserQuery(e.target.value)}
              />
              <div className=""></div>
              <Button
                onClick={handleSubmit}
                className="bg-red-500  text-white px-6 py-3 rounded-md"
              >
                New Project
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
