const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const root = __dirname;
const smartTrack = path.join(root, "Smartracker-Chinu", "SmartTrack");
const campusWeb = path.join(
  root,
  "campus-3d-main",
  "campus-3d-main",
  "web-platform",
);

function resolvePython() {
  if (process.env.PYTHON_PATH && fs.existsSync(process.env.PYTHON_PATH)) {
    return process.env.PYTHON_PATH;
  }
  const localVenvPosix = path.join(smartTrack, ".venv", "bin", "python");
  if (fs.existsSync(localVenvPosix)) return localVenvPosix;

  const localVenvWin = path.join(smartTrack, ".venv", "Scripts", "python.exe");
  if (fs.existsSync(localVenvWin)) return localVenvWin;

  if (process.env.LOCALAPPDATA) {
    const appdataPython = path.join(
      process.env.LOCALAPPDATA,
      "CampusGuide3D",
      "SmartTrack",
      "Scripts",
      "python.exe",
    );
    if (fs.existsSync(appdataPython)) return appdataPython;
  }
  return process.platform === "win32" ? "python" : "python3";
}

const python = resolvePython();
const nextCli = path.join(campusWeb, "node_modules", "next", "dist", "bin", "next");
const children = [];
let shuttingDown = false;

function stopServices() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill();
  }
}

function startService(label, command, args, cwd, env) {
  const child = spawn(command, args, { cwd, env, stdio: "inherit" });
  children.push(child);

  child.on("error", (error) => {
    console.error(`${label} could not start: ${error.message}`);
    process.exitCode = 1;
    stopServices();
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    console.error(
      `${label} stopped${signal ? ` (${signal})` : ` with exit code ${code}`}. Stopping the other service.`,
    );
    process.exitCode = code && code !== 0 ? code : 1;
    stopServices();
  });

  return child;
}

async function waitUntilReady(label, url, child) {
  const deadline = Date.now() + 120_000;

  while (Date.now() < deadline) {
    if (shuttingDown || child.exitCode !== null) {
      throw new Error(`${label} exited before becoming ready.`);
    }

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (response.status < 500) {
        console.log(`${label} is ready at ${url}`);
        return;
      }
    } catch {
      // The server can refuse connections while its development process starts.
    }

    await new Promise((resolve) => setTimeout(resolve, 750));
  }

  throw new Error(`${label} did not respond within 120 seconds.`);
}

async function main() {
  const env = {
    ...process.env,
    CAMPUS_APP_ORIGIN: "http://localhost:3000",
  };

  const smartTracker = startService(
    "SmartTracker",
    python,
    ["manage.py", "runserver", "127.0.0.1:8000"],
    smartTrack,
    env,
  );
  const campus = startService(
    "Campus Guide",
    process.execPath,
    [nextCli, "dev", "--hostname", "127.0.0.1"],
    campusWeb,
    env,
  );

  process.on("SIGINT", stopServices);
  process.on("SIGTERM", stopServices);

  try {
    await Promise.all([
      waitUntilReady("SmartTracker", "http://localhost:8000/", smartTracker),
      waitUntilReady("Campus Guide", "http://localhost:3000/", campus),
    ]);
    console.log("Both services are running. Press Ctrl+C to stop them.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    stopServices();
  }
}

main();
