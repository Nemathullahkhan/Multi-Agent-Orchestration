"use client";

import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Dashboard() {
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
  }
  return (
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
  );
}
