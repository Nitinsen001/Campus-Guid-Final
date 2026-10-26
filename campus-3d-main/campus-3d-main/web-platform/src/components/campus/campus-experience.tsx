"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  ExternalLink,
  Gamepad2,
  Search,
  UserRoundSearch,
  X,
} from "lucide-react";
import { UnityPlayer } from "./unity-player";
import { IndoorNavigation } from "./indoor-navigation";
import type { Destination } from "@/lib/campus/types";

const smartTrackerUrl =
  process.env.NEXT_PUBLIC_SMARTTRACKER_URL || "http://localhost:8000";

export function CampusExperience() {
  const searchParams = useSearchParams();
  const queryMode = searchParams.get("mode");

  const [activeTab, setActiveTab] = useState<"explore" | "game" | "directory">(
    "explore"
  );
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [activeFloorId, setActiveFloorId] = useState(0);
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const [isSmartTrackerOpen, setIsSmartTrackerOpen] = useState(false);

  useEffect(() => {
    if (queryMode === "game") {
      setActiveTab("game");
    } else if (queryMode === "directory" || queryMode === "indoor") {
      setActiveTab("directory");
    } else {
      setActiveTab("explore");
    }
    setIsSmartTrackerOpen(queryMode === "faculty");
  }, [queryMode]);

  return (
    <div className="relative flex h-[calc(100vh-110px)] w-full flex-col overflow-hidden bg-slate-950 font-sans">
      {/* Top Header Mode Dock */}
      <div className="z-30 flex items-center justify-between border-b-4 border-black bg-black/90 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("explore")}
            className={`flex items-center gap-1.5 border-2 border-black px-3 py-1.5 text-xs font-black tracking-wider uppercase shadow-[2px_2px_0px_#000000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              activeTab === "explore"
                ? "bg-[#ffe600] text-black"
                : "bg-white text-black hover:bg-yellow-100"
            }`}
          >
            <Compass className="h-4 w-4" />
            3D Explore Mode
          </button>

          <button
            onClick={() => setActiveTab("game")}
            className={`flex items-center gap-1.5 border-2 border-black px-3 py-1.5 text-xs font-black tracking-wider uppercase shadow-[2px_2px_0px_#000000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              activeTab === "game"
                ? "bg-[#4ecdc4] text-black"
                : "bg-white text-black hover:bg-teal-100"
            }`}
          >
            <Gamepad2 className="h-4 w-4" />
            Game Mode
          </button>

          <button
            onClick={() => setActiveTab("directory")}
            className={`flex items-center gap-1.5 border-2 border-black px-3 py-1.5 text-xs font-black tracking-wider uppercase shadow-[2px_2px_0px_#000000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              activeTab === "directory"
                ? "bg-[#ff6b9d] text-black"
                : "bg-white text-black hover:bg-pink-100"
            }`}
          >
            <Search className="h-4 w-4" />
            Campus Directory
          </button>
        </div>

        {/* Quick Search Drawer Trigger (visible during 3D modes) */}
        {activeTab !== "directory" && (
          <button
            onClick={() => setIsSearchDrawerOpen((prev) => !prev)}
            className="flex items-center gap-1.5 border-2 border-black bg-white px-3 py-1.5 text-xs font-black tracking-wider text-black uppercase shadow-[2px_2px_0px_#000000] hover:bg-yellow-200"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search Rooms / Faculty</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative h-full w-full flex-1 overflow-hidden">
        {/* 3D Unity Canvas View for Explore & Game */}
        {(activeTab === "explore" || activeTab === "game") && (
          <div className="h-full w-full">
            <UnityPlayer
              initialMode={activeTab}
              onModeChange={(newMode) => setActiveTab(newMode)}
            />
          </div>
        )}

        {/* Directory View (Dedicated tab) */}
        {activeTab === "directory" && (
          <div className="flex h-full w-full justify-center overflow-y-auto bg-[#dff4ff] p-6 lg:p-10">
            <div className="w-full max-w-2xl">
              <div className="mb-6">
                <span className="mb-2 inline-block bg-black px-3 py-1 text-xs font-black tracking-widest text-white uppercase">
                  Live Campus Directory
                </span>
                <h1 className="text-3xl font-black tracking-tight text-black uppercase">
                  Rooms, Faculty & Departments
                </h1>
                <p className="mt-1 text-xs font-bold text-gray-800">
                  Search across all college facilities, classrooms, department
                  hubs, and faculty offices.
                </p>
              </div>

              <IndoorNavigation
                currentFloorId={activeFloorId}
                selectedDestination={selectedDestination}
                onSelectDestination={setSelectedDestination}
                onConfirmFloorTransfer={setActiveFloorId}
              />
            </div>
          </div>
        )}

        {/* Floating Search Panel / Drawer during 3D modes */}
        {activeTab !== "directory" && isSearchDrawerOpen && (
          <div className="animate-in fade-in slide-in-from-right absolute top-4 right-4 z-40 w-full max-w-sm duration-200">
            <div className="relative">
              <button
                onClick={() => setIsSearchDrawerOpen(false)}
                className="absolute -top-3 -right-3 z-50 rounded-full border-2 border-white bg-black p-1.5 text-white transition-colors hover:bg-red-600"
                aria-label="Close search panel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <IndoorNavigation
                currentFloorId={activeFloorId}
                selectedDestination={selectedDestination}
                onSelectDestination={(dest) => {
                  setSelectedDestination(dest);
                  if (dest) setActiveFloorId(dest.floorId);
                }}
                onConfirmFloorTransfer={setActiveFloorId}
              />
            </div>
          </div>
        )}

        {isSmartTrackerOpen && (
          <section
            className="absolute inset-0 z-40 flex flex-col bg-slate-950"
            aria-label="SmartTracker faculty locator"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-black bg-black px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <UserRoundSearch className="h-5 w-5 text-[#ff6b9d]" />
                <h2 className="text-sm font-black tracking-wider uppercase">
                  Find Faculty · SmartTracker
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={smartTrackerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 border-2 border-black bg-white px-2.5 py-1.5 text-[10px] font-black text-black uppercase hover:bg-pink-200"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open separately
                </a>
                <button
                  onClick={() => setIsSmartTrackerOpen(false)}
                  className="border-2 border-black bg-[#ff6b9d] p-1.5 text-black hover:bg-pink-300"
                  aria-label="Close SmartTracker"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>
            <iframe
              title="SmartTracker faculty locator"
              src={smartTrackerUrl}
              className="min-h-0 w-full flex-1 border-0 bg-[#0d1117]"
              allow="fullscreen"
            />
          </section>
        )}
      </div>
    </div>
  );
}
