"use client"

import { Skeleton } from "@/components/ui/skeleton"

const Page = () => {
  return (
    <section className="flex flex-col gap-2">
      <Skeleton className="w-full h-[50dvh]" />
      <div className="flex gap-2">
        <Skeleton className="h-[20dvh] w-full"/>
        <Skeleton className="h-[20dvh] w-full"/>
        <Skeleton className="h-[20dvh] w-full"/>
        <Skeleton className="h-[20dvh] w-full"/>
      </div >
      <Skeleton className="w-full h-[50dvh]" />
    </section>
  );
};

export default Page;
