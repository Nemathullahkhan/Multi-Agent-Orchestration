import Image from "next/image";
import prisma from "@/lib/prisma";

export default async function Home() {
  const users = await prisma.user.findMany();

  return (
    <div className="flex flex-col items-center  bg-zinc-900 h-screen w-full px-10 py-12">
      <div className="grid grid-cols-2 gap-10 w-full ">
        <div className="bg-zinc-800 p-4 rounded-lg text-4xl text-zinc-50 font-semibold tracking-tighter">
          Chat Box
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg text-4xl text-zinc-50 font-semibold tracking-tighter">
          Browser + File System
          {users.map((user) => (
            <p key={user.id} className="text-md">
              {user.email}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
