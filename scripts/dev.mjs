import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const env = {
  ...process.env,
  RAYON_NUM_THREADS: process.env.RAYON_NUM_THREADS ?? "2",
};
const children = [
  spawn(
    process.execPath,
    [
      path.join(root, "node_modules/tsx/dist/cli.mjs"),
      "watch",
      "src/server.ts",
    ],
    { cwd: path.join(root, "apps/api"), stdio: "inherit", env },
  ),
  spawn(
    process.execPath,
    [path.join(root, "node_modules/vite/bin/vite.js"), "--host", "127.0.0.1"],
    { cwd: path.join(root, "apps/web"), stdio: "inherit", env },
  ),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
for (const child of children) {
  child.on("error", (error) => {
    console.error(error);
    stop(1);
  });
  child.on("exit", (code) => stop(code ?? 1));
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
