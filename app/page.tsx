"use client";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) {
      router.push("/signin");
    }
  }, [session, router]);

  const user = session?.user;

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
      <div className="grid grid-cols-2 gap-10 w-full ">
        <div className="bg-zinc-800 p-4 rounded-lg text-4xl text-zinc-50 font-semibold tracking-tighter">
          Chat Box
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg text-4xl text-zinc-50 font-semibold tracking-tighter">
          Browser + File System
          <h1>Welcome, {user?.name}</h1>
        </div>
      </div>
    </div>
  );
}
