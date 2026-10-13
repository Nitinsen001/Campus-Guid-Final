# Campus Guide 3D

Production-ready web-based digital twin of the college campus. Students, visitors, faculty, and administrators can search locations, explore the campus in 3D, and play the interactive game mode — all inside the browser.

## Project Structure

```
CampusGuide3D/
├── blender/              # Source of truth — campus 3D models originate here
├── UnityWebGL/           # WebGL build with Blender campus model (Game & Explore modes)
├── data/                 # Standard JSON datasets (rooms, departments, faculty, navigation)
├── database/scripts/     # Data import and utility scripts
├── docs/                 # Architecture & system design documentation
└── web-platform/         # Next.js 15 production web application
```

## 3D Engine & Asset Pipeline

```
Blender Campus Model → Unity (Physics, Colliders, Player Controller, Cameras) → Unity WebGL → Next.js Web Platform
```

- **Explore Mode:** Cinematic 3D camera exploration of the college campus.
- **Game Mode:** Third-person playable character navigation with physics, collision detection, and jumping.
- **Campus Directory:** Live searchable database of rooms, departments, and faculty with entrance-to-room pathfinding.

## Run the Complete Campus Guide

The Campus Guide serves the home page, campus directory, and included Unity WebGL build for Explore and Game modes. In either 3D mode, choose **Find Faculty** to open SmartTracker in the same screen. Use the combined launcher to start both services together.

```powershell
cd "<folder containing campus-3d-main and Smartracker-Chinu>"
powershell -ExecutionPolicy Bypass -File .\start-campus.ps1
```

On its first run, the launcher creates an isolated Python environment, installs missing dependencies, and applies database migrations. It imports the adjacent `Faculty data.json` only if a SmartTracker database does not already exist, so existing faculty records are preserved. Node.js (18.18 or newer), npm, and the Windows Python launcher (`py`) must be installed. Open [http://localhost:3000](http://localhost:3000); choose Explore or Game, then click **Find Faculty**. Both services run in the same terminal; press `Ctrl+C` to stop them.

The Campus Guide navigation bar includes **Admin Panel**, which opens SmartTracker's staff login. Sign in with the existing SmartTracker staff/admin account to reach its faculty and timetable dashboard. A staff account must already exist; the launcher does not create admin accounts.

For hosted deployments, set `NEXT_PUBLIC_SMARTTRACKER_URL` in `web-platform/.env.local` to the SmartTracker base URL and set `CAMPUS_APP_ORIGIN` for Django to the Campus Guide origin. The `start-campus.ps1` launcher is for running both local projects together.

The `web-platform` folder is a Git submodule, so clone with `--recurse-submodules`. The Unity WebGL files used by the app are already under `web-platform/public/unity`; they are served by the same local server, not launched as another application. Blender and Unity authoring projects are only needed to edit/rebuild campus assets. See [requirements.txt](requirements.txt) for the complete setup and production commands.

## Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · Framer Motion · Lucide Icons · Unity WebGL (Brotli Wasm)
