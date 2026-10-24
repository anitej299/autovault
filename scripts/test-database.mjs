import { spawnSync } from "node:child_process";
const url =
  process.env.TEST_DATABASE_URL ??
  "postgresql://autovault:test_only_password@localhost:5433/autovault_test";
const parsed = new URL(url);
if (
  parsed.pathname !== "/autovault_test" ||
  !["localhost", "127.0.0.1"].includes(parsed.hostname) ||
  parsed.port !== "5433"
)
  throw new Error("Refusing unsafe test database URL");
const result = spawnSync(
  process.execPath,
  [
    "node_modules/prisma/build/index.js",
    "migrate",
    "deploy",
    "--schema",
    "apps/api/prisma/schema.prisma",
  ],
  { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
