"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await signIn.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (res.error) {
      setError(res.error.message || "Soemthing went wrong");
    } else {
      router.push("/");
    }
  }

  return (
    <main className="max-w-xl h-screen flex items-center justify-center flex-col mx-auto p-6 text-white">
      {error && <p className="text-red-400 mb-4">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="w-full h-[500px] border border-zinc-800 bg-zinc-900 rounded-2xl px-6 py-8 shadow-2xl flex flex-col justify-center"
      >
        <div className="flex flex-col items-center justify-center mb-10 space-y-2">
          <Bot size={64} />

          <h1 className="text-4xl font-bold tracking-tight text-neutral-50">
            Sign In
          </h1>
          <p className="text-zinc-400 text-sm">Welcome back!</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2 px-10">
            <label className="text-md font-medium text-neutral-300">
              Email
            </label>

            <input
              required
              name="email"
              placeholder="johnDoe@example.com"
              className="w-full  bg-zinc-800 border border-zinc-700 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-zinc-500 transition-all rounded-md"
            />
          </div>

          <div className="space-y-2 px-10">
            <label className="text-sm font-medium text-neutral-300">
              Password
            </label>

            <input
              required
              name="password"
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-zinc-500 transition-all"
            />
          </div>
          <div className="flex justify-center items-center">
            <p className="text-zinc-400 text-sm">
              New User? Get Started with{" "}
              <a
                href="/signup"
                className="ml-1 underline text-neutral-50 font-semibold"
              >
                Sign Up
              </a>
            </p>
          </div>

          <div className="max-w-xs mx-auto flex justify-center ">
            <Button
              type="submit"
              className=" w-2/4 mt-4 rounded-md font-semibold h-10 text-md tracking-tight bg-neutral-200 text-primary hover:bg-neutral-50"
            >
              Sign In
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
