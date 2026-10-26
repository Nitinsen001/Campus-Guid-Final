import { Suspense } from "react";
import { CampusExperience } from "@/components/campus/campus-experience";

export default function CampusPage() {
  return (
    <main className="min-h-screen w-full bg-slate-900 pt-[110px]">
      <Suspense
        fallback={
          <div className="flex h-[calc(100vh-110px)] w-full items-center justify-center bg-slate-950 text-sm font-black text-white uppercase">
            Loading Campus Experience...
          </div>
        }
      >
        <CampusExperience />
      </Suspense>
    </main>
  );
}
