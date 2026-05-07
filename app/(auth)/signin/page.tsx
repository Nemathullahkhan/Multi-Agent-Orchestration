"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
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
    <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6 space-y-4 text-white">
      <h1 className="text-2xl font-bold">Sign In</h1>
      {error && <p className="text-red-400">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-2 flex flex-col">
        <input
          required
          name="email"
          placeholder="johnDoe@example.com"
          className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2"
        />
        <input
          required
          name="password"
          type="password"
          placeholder=""
          className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2"
        />
        <Button type="submit">Log In </Button>
      </form>
    </main>
  );
}
