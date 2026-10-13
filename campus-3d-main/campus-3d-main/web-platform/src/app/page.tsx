import Link from "next/link";
import { NeoCard } from "@/components/neo-brutal/neo-card";
import { Compass, Gamepad2, Search, Building2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="page-content flex min-h-screen items-center bg-[#dff4ff]">
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-stretch">
          {/* Left Column - Hero Card */}
          <NeoCard className="neo-card-orange flex flex-col justify-between p-8">
            <div>
              <span className="mb-6 inline-flex items-center gap-1.5 bg-black px-3 py-1 text-xs font-black tracking-widest text-white uppercase">
                <Sparkles className="h-3.5 w-3.5 text-[#ffe600]" />
                Blender Digital Campus Twin
              </span>
              <h1 className="mb-6 text-4xl leading-none font-black tracking-tight text-black uppercase lg:text-5xl">
                Explore Campus.
                <br />
                Play The Game.
              </h1>
              <p className="max-w-lg text-base leading-relaxed font-bold text-gray-900">
                Step into the 3D Blender digital twin of the college campus.
                Explore grounds cinematically, navigate rooms and departments,
                or switch to Game Mode for interactive 3D gameplay.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/campus?mode=explore"
                className={cn(
                  "neo-border neo-shadow inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold tracking-wide uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current",
                  "border-4 border-black bg-[#ffe600] text-black hover:bg-yellow-300",
                )}
              >
                <Compass className="h-5 w-5" />
                Explore Campus
              </Link>
              <Link
                href="/campus?mode=game"
                className={cn(
                  "neo-border neo-shadow inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold tracking-wide uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current",
                  "border-4 border-black bg-[#4ecdc4] text-black hover:bg-teal-300",
                )}
              >
                <Gamepad2 className="h-5 w-5" />
                Play Game Mode
              </Link>
            </div>
          </NeoCard>

          {/* Right Column - Features Card */}
          <NeoCard className="neo-card-purple p-8">
            <h2 className="mb-6 text-xl font-black tracking-wide text-white uppercase">
              Campus Features
            </h2>
            <div className="grid h-[calc(100%-3rem)] grid-cols-2 gap-4">
              {[
                {
                  icon: Compass,
                  label: "3D Explore",
                  desc: "Find faculty with SmartTracker",
                  bgClass: "neo-card-yellow",
                  href: "/campus?mode=faculty",
                },
                {
                  icon: Gamepad2,
                  label: "Game Mode",
                  desc: "Third-person character physics",
                  bgClass: "neo-card-pink",
                  href: "/campus?mode=game",
                },
                {
                  icon: Search,
                  label: "Smart Directory",
                  desc: "Rooms, labs & departments",
                  bgClass: "neo-card-blue",
                  href: "/campus?mode=directory",
                },
                {
                  icon: Building2,
                  label: "Pathfinding",
                  desc: "Entrance-to-room navigation",
                  bgClass: "neo-card-green",
                  href: "/campus?mode=directory",
                },
              ].map(({ icon: Icon, label, desc, bgClass, href }) => (
                <Link key={label} href={href} className="group block">
                  <div
                    className={`${bgClass} flex h-full flex-col justify-between p-4 transition-transform group-hover:-translate-y-1`}
                  >
                    <div>
                      <Icon className="mb-2 h-8 w-8 text-black" />
                      <p className="text-xs font-black tracking-tight text-black uppercase">
                        {label}
                      </p>
                    </div>
                    <p className="mt-2 text-[10px] leading-snug font-bold text-gray-900">
                      {desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </NeoCard>
        </div>
      </section>
    </main>
  );
}
