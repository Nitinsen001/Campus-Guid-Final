"use client";

import { useRef, useState, useEffect } from "react";
import {
  Maximize2,
  RotateCcw,
  HelpCircle,
  Gamepad2,
  Compass,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { NeoCard } from "../neo-brutal/neo-card";

interface UnityPlayerProps {
  initialMode?: "explore" | "game";
  onModeChange?: (mode: "explore" | "game") => void;
}

export function UnityPlayer({
  initialMode = "explore",
  onModeChange,
}: UnityPlayerProps) {
  const [mode, setMode] = useState<"explore" | "game">(initialMode);
  const [isLoading, setIsLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (iframeRef.current?.contentDocument?.readyState === "complete") {
      setIsLoading(false);
    }
  }, []);

  const handleModeSwitch = (newMode: "explore" | "game") => {
    setMode(newMode);
    if (onModeChange) onModeChange(newMode);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = "/unity/index.html";
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full flex-col overflow-hidden bg-slate-950 select-none"
    >
      {/* Control Topbar */}
      <div className="z-20 flex flex-wrap items-center justify-between gap-3 border-b-4 border-black bg-black/80 p-3 text-white backdrop-blur-md">
        <div className="flex items-center gap-2">
          {/* Mode Selector Buttons */}
          <button
            onClick={() => handleModeSwitch("explore")}
            className={`flex items-center gap-1.5 border-2 border-black px-3 py-1.5 text-xs font-black tracking-wider uppercase shadow-[2px_2px_0px_#000000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              mode === "explore"
                ? "bg-[#ffe600] text-black"
                : "bg-slate-800 text-white hover:bg-slate-700"
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            Campus Explore Mode
          </button>

          <button
            onClick={() => handleModeSwitch("game")}
            className={`flex items-center gap-1.5 border-2 border-black px-3 py-1.5 text-xs font-black tracking-wider uppercase shadow-[2px_2px_0px_#000000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              mode === "game"
                ? "bg-[#4ecdc4] text-black"
                : "bg-slate-800 text-white hover:bg-slate-700"
            }`}
          >
            <Gamepad2 className="h-3.5 w-3.5" />
            Game Mode
          </button>
        </div>

        {/* Status Badge & Helper Actions */}
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded border border-slate-700 bg-black/60 px-2.5 py-1 text-[10px] font-bold text-slate-300 sm:inline-flex">
            <Sparkles className="h-3 w-3 text-[#ffe600]" />
            Blender College Model
          </span>

          <button
            onClick={() => setShowHelp((prev) => !prev)}
            className="border-2 border-black bg-white p-1.5 text-black shadow-[2px_2px_0px_#000000] transition-colors hover:bg-yellow-300 active:translate-x-[1px] active:translate-y-[1px]"
            title="Controls Guide"
            aria-label="Controls Guide"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          <button
            onClick={handleReload}
            className="border-2 border-black bg-white p-1.5 text-black shadow-[2px_2px_0px_#000000] transition-colors hover:bg-yellow-300 active:translate-x-[1px] active:translate-y-[1px]"
            title="Reload 3D Engine"
            aria-label="Reload 3D Engine"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={handleFullscreen}
            className="border-2 border-black bg-[#ffe600] p-1.5 text-black shadow-[2px_2px_0px_#000000] transition-colors hover:bg-yellow-400 active:translate-x-[1px] active:translate-y-[1px]"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Unity Canvas Frame */}
      <div className="relative h-full w-full flex-1 bg-[#0f172a]">
        <iframe
          ref={iframeRef}
          src="/unity/index.html"
          title="Unity Campus Experience"
          className="block h-full w-full border-0"
          allow="fullscreen; autoplay"
          onLoad={() => setIsLoading(false)}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
            <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-black border-t-[#ffe600]" />
            <h3 className="text-xl font-black tracking-wide text-white uppercase">
              Initializing 3D Campus
            </h3>
            <p className="mt-2 max-w-sm text-xs font-bold text-slate-400">
              Loading WebGL engine and Blender college digital twin...
            </p>
          </div>
        )}

        {/* Controls Help Modal */}
        {showHelp && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <NeoCard className="neo-card-yellow w-full max-w-md p-6">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="flex items-center gap-2 text-lg font-black text-black uppercase">
                  <Gamepad2 className="h-5 w-5 text-black" />
                  Navigation & Controls
                </h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="border-2 border-black bg-white px-2 py-0.5 text-xs font-black hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs font-bold text-gray-900">
                <div className="flex items-center justify-between border-2 border-black bg-white p-3">
                  <span>Movement:</span>
                  <span className="rounded bg-black px-2 py-1 font-mono text-[10px] text-white">
                    W / A / S / D or Arrow Keys
                  </span>
                </div>
                <div className="flex items-center justify-between border-2 border-black bg-white p-3">
                  <span>Camera Look:</span>
                  <span className="rounded bg-black px-2 py-1 font-mono text-[10px] text-white">
                    Mouse Drag / Cursor
                  </span>
                </div>
                <div className="flex items-center justify-between border-2 border-black bg-white p-3">
                  <span>Sprint / Run:</span>
                  <span className="rounded bg-black px-2 py-1 font-mono text-[10px] text-white">
                    Left Shift
                  </span>
                </div>
                <div className="flex items-center justify-between border-2 border-black bg-white p-3">
                  <span>Jump:</span>
                  <span className="rounded bg-black px-2 py-1 font-mono text-[10px] text-white">
                    Spacebar
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 bg-black p-3 text-[11px] font-bold text-white">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4ecdc4]" />
                <span>
                  Click inside the canvas to lock keyboard focus. Press ESC to
                  release.
                </span>
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="mt-4 w-full border-4 border-black bg-[#4ecdc4] py-2 font-black tracking-wider text-black uppercase shadow-[2px_2px_0px_#000000] transition-colors hover:bg-teal-300"
              >
                Got It
              </button>
            </NeoCard>
          </div>
        )}
      </div>
    </div>
  );
}
