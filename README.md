# Campus Guide 3D & SmartTracker (Final Pack)

Complete college digital twin with:
1. **Explore & Game Mode:** Interactive 3D Unity WebGL campus walking & third-person character gameplay.
2. **Campus Directory & Indoor Navigation:** Floor-by-floor room search and pathfinding.
3. **SmartTracker Faculty Locator:** 3D campus faculty locator with real-time timetable tracking, ML predictions, and administrative dashboards.

---

## Quick Setup & Run

### Prerequisites
* **Node.js:** v18.18 or newer
* **Python:** 3.10 or newer

---

### Step 1: Install Dependencies (First Run Only)

#### 1. Frontend Dependencies:
```bash
cd campus-3d-main/campus-3d-main/web-platform
npm install
cd ../../..
```

#### 2. Backend Dependencies:
```bash
cd Smartracker-Chinu/SmartTrack
python3 -m venv .venv
# On macOS / Linux:
source .venv/bin/activate
# On Windows (PowerShell):
# .venv\Scripts\Activate.ps1

pip install -r requirements.txt
python manage.py migrate
cd ../..
```

---

### Step 2: Run Both Services (One Command)

From the project root:

```bash
node start-campus.js
```

Or on Windows PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File .\start-campus.ps1
```

Both services will start concurrently:
* **Campus Guide 3D (Frontend):** [http://localhost:3000](http://localhost:3000)
  * Explore Mode: `http://localhost:3000/campus?mode=explore`
  * Game Mode: `http://localhost:3000/campus?mode=game`
  * Find Faculty: `http://localhost:3000/campus?mode=faculty`
* **SmartTracker (Backend):** [http://localhost:8000](http://localhost:8000)
  * Admin Portal: `http://localhost:8000/admin-panel/`
