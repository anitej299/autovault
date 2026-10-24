# AutoVault — Test and verification report

Verification date: **24 October 2026, 18:53 IST (Asia/Calcutta)**. Results below come from executed commands and saved terminal output. No human acceptance testing is claimed.

## Final results

| Check                                |             Passed |        Failed | Skipped | Evidence                                                 |
| ------------------------------------ | -----------------: | ------------: | ------: | -------------------------------------------------------- |
| Backend — six suites                 |                 71 |             0 |       0 | [Final coverage run](evidence/coverage-complete.txt)     |
| Frontend — one suite                 |                 11 |             0 |       0 | [Final coverage run](evidence/coverage-complete.txt)     |
| Playwright Chromium — four E2E flows |                  4 |             0 |       0 | [Final E2E run](evidence/e2e-final.txt)                  |
| ESLint                               |               pass |             — |       — | [Lint](evidence/lint-complete.txt)                       |
| TypeScript API and web               |               pass |             — |       — | [Type checks](evidence/typecheck-latest.txt)             |
| Production API/web builds            |               pass |             — |       — | [Build](evidence/build-latest.txt)                       |
| npm install / Prisma generation      |               pass |             — |       — | [Install](evidence/install-final.txt)                    |
| npm audit                            |  0 vulnerabilities |             — |       — | [Audit JSON](evidence/npm-audit.json)                    |
| Real screenshots                     |         5 captured | 0 page errors |       — | [Capture output](evidence/screenshots-final.txt)         |
| Test database guard                  | unsafe URL refused |             — |       — | [Intentional guard failure](evidence/database-guard.txt) |

The ordinary test command passed 68 backend + 11 frontend tests before three additional validator unit regressions were added. The final coverage command executed all **71 backend + 11 frontend tests successfully**. E2E was run after the production source/dependency changes; the subsequent additions were tests and documentation only. Total final test cases across these suites: **86**.

## Measured V8 coverage

| Application | Statements           | Branches             | Functions          | Lines                |
| ----------- | -------------------- | -------------------- | ------------------ | -------------------- |
| API         | **98.71%** (154/156) | **90.56%** (48/53)   | **100%** (35/35)   | **99.33%** (150/151) |
| Web         | **70.25%** (111/158) | **66.80%** (157/235) | **59.67%** (37/62) | **71.52%** (108/151) |

The API enforces 85% statements and branches. Coverage includes API src modules except the process startup entrypoint. Development seeding and build tooling are not counted. Frontend main.tsx and tests are excluded. Frontend component coverage does not measure E2E execution; management form and dialog keyboard branches remain partially uncovered by component tests. No claim of 85% frontend coverage is made.

## Environment

- Windows 10.0.26300, PowerShell, workspace D:\Codex\AutoVault.
- Final runtime: Node **22.23.4** (project-local LTS runtime on D:); npm **10.9.2**. Initial RED/GREEN runs used the preinstalled Node 23.10.0 and Vitest 3.2.7 before compatibility/security upgrades.
- Final test runner: Vitest **5.0.5**, V8 coverage. Frontend Vite **7.3.7**, compatible React plugin **5.2.0**.
- PostgreSQL **17.11**, Alpine x86_64, from postgres:17-alpine under Docker Desktop **29.4.3**.
- Development database: localhost:5432/autovault; isolated test database: localhost:5433/autovault_test. Both were migrated. Development data was seeded and survived container restart.
- Chromium **156.0.8078.4**, Playwright browser build v1248. Browser downloads and temporary data were stored on D:.
- E2E: one worker, API port 4001, web port 5174, fixed isolated test fixtures. Development API/web: ports 4000/5173.

## Exact verification commands executed

After relocation, commands used a machine-local wrapper `./work/npm.ps1` which sets D: temp/cache/runtime paths and invokes Node 22.23.4 with the installed npm CLI. The equivalent portable commands are npm commands with the same arguments. The wrapper itself is ignored, not a required repository dependency.

```powershell
# Infrastructure (initial project name retained locally)
docker desktop start
docker compose -p you-are-a-senior-full-stack up -d --wait
# Later .env retained COMPOSE_PROJECT_NAME, so this used the same containers:
docker compose up -d --wait

# Install / migration / seed
./work/npm.ps1 install --offline=false
./work/npm.ps1 run db:migrate
./work/npm.ps1 run db:seed

# Final verification (saved with Tee-Object in work/)
./work/npm.ps1 run format
./work/npm.ps1 run lint
./work/npm.ps1 run typecheck
./work/npm.ps1 run build
./work/npm.ps1 run test
./work/npm.ps1 run test:coverage
./work/npm.ps1 audit --json

$env:PLAYWRIGHT_BROWSERS_PATH='D:\Codex\AutoVault\work\browsers'
$env:NODE_OPTIONS='--max-old-space-size=256'
./work/npm.ps1 run test:e2e

# Live verification / screenshot script
./work/npm.ps1 run dev
& 'D:\Codex\AutoVault\work\runtime\node_modules\node\bin\node.exe' work/capture.mjs
Invoke-RestMethod http://127.0.0.1:4000/api/health

docker compose exec -T db psql -U autovault -d autovault -t -c 'SELECT version();'
git diff --check
```

The E2E pre-script automatically runs guarded test migration and both builds. The test/coverage pre-scripts automatically migrate the isolated test database. Raw output in evidence includes the commands' npm lifecycle expansion.

The database guard was tested with TEST_DATABASE_URL set to a deliberately non-local, nonexistent production-style host; it threw **Refusing unsafe test database URL** before spawning Prisma. This intentional failure is not a failed application test. No production database was contacted.

## Suites and behaviors

| Suite                   | Cases | Coverage of behavior                                                                                                                                                                                          |
| ----------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth.test.ts            |     7 | normalized registration, bcrypt hash/non-disclosure, duplicate email, weak password, role injection, invalid email, login and uniform missing-user/wrong-password response                                    |
| vehicles.test.ts        |    24 | missing/invalid/expired JWT, role checks, create/list/update/delete, invalid prices/stock/fields/UUIDs, sold-out inclusion and real missing-record JSON                                                       |
| search.test.ts          |    14 | make/model/category partial matching, inclusive price range, combinations, empty results, invalid bounds/page/sort, stable pagination and exact summary                                                       |
| inventory.test.ts       |    17 | default/multiple purchase quantity, zero/exceeded stock, concurrent last unit, actual rollback injection, restock roles/validation/overflow, missing vehicles, purchase history retention and unsafe payloads |
| security.test.ts        |     6 | database health, JSON 404, malformed signed JWT subject, payload limits, Helmet/CORS and invalid JSON                                                                                                         |
| validators.unit.test.ts |     3 | UTF-8 bcrypt byte boundary, email normalization, exact maximum-precision decimal strings                                                                                                                      |
| app.test.tsx            |    11 | route protection, login/register validation, successful login, live response rendering, role-aware controls, filters, zero stock, purchase invalidation/failure and mobile navigation                         |

The auth suite combines multiple assertions in individual tests; case totals are runner counts, not counts of every assertion.

## Concurrency and rollback

The race test sets stock to one, concurrently sends two real HTTP purchases, and asserts sorted statuses **[201,409]**, final stock **0**, and exactly **one** purchase record. It passed in final API runs.

The rollback test creates a PostgreSQL BEFORE INSERT trigger that raises an exception during purchase insertion. The API returns 500, stock remains at its original quantity and no purchase persists. The trigger/function are dropped in finally. This exercises a real database failure, not a mocked transaction.

The first implementation run produced [201,500] because connection acquisition exceeded the initial wait. The bounded transaction acquisition wait was increased to 10 seconds; the subsequent GREEN run passed. [Initial failure](evidence/inventory-green.txt), [successful retry](evidence/inventory-green-retry.txt).

## Real TDD evidence

| Stage                  | RED     | GREEN   | Recorded failures before implementation |
| ---------------------- | ------- | ------- | --------------------------------------- |
| Authentication         | 59b9a06 | 56be36d | 7                                       |
| Roles / CRUD           | 6b12a8d | 2fedc2f | 22 (one incidental existing 404 pass)   |
| Search                 | 2f127b9 | a536ca2 | 14                                      |
| Inventory transactions | 9db87d5 | 2d42aaf | 13 (one incidental existing 404 pass)   |
| Security/errors        | 8b99748 | 001f222 | 4 (two existing-behavior passes)        |
| React UI               | e3e0c94 | bc33212 | 11                                      |

The missing-record tests were later strengthened so absent routes cannot satisfy their assertions (2c02792). Additional unit tests are explicitly regression coverage for already implemented behavior, not retroactively claimed RED tests. Refactor commit 27da93b preserves the formatting/unused-query cleanup separately. Commits contain a blank-line-separated ChatGPT co-author trailer. No dates were rewritten, no human review was claimed and no remote was pushed.

## E2E and screenshots

Final E2E: **4 passed in 23.9 seconds**, zero failed/skipped:

1. Unauthenticated inventory redirects to login.
2. Register, logout/login, browse, filter, purchase two units, verify decrement and persistence on reload; sold-out purchase disabled.
3. Admin login, create, edit, restock and delete a vehicle through the UI.
4. Mobile navigation at 390×844 and no horizontal overflow.

Five actual screenshot files: [login](../screenshots/login.png), [inventory](../screenshots/inventory.png), [filtered search](../screenshots/search.png), [admin add form](../screenshots/admin.png), [mobile](../screenshots/mobile.png). They use development PostgreSQL data (nine listings, 44 units) and original SVG illustrations. The assistant inspected rendered images; this is not human manual verification. Capture output reported zero page errors and no mobile horizontal overflow. Summary totals were awaited before final captures.

## Issues encountered and remaining limitations

Resolved during execution:

- C: filled during the first install. User explicitly authorized moving project/cache to D:.
- Docker stopped during the interruption and was restarted; existing volumes were preserved.
- Transaction connection-wait timeout found by the race test and fixed before GREEN.
- Test/coverage package hoisting, stale npm workspace entries and optional resolver peer conflicts fixed through compatible versions and a clean installation.
- Fresh Prisma generation added to postinstall.
- Vite 8 native optimizer allocation failures on this host resolved by compatible patched Vite 7 and a lighter dev launcher. Final npm run dev served both applications successfully.
- A workspace approval-review spend cap temporarily blocked commands; access was restored on continuation.

Remaining / candid scope:

- Rollup emits two harmless third-party Zod comment-annotation warnings; builds complete. jsdom has a transitive deprecated whatwg-encoding package. Final npm audit reports zero vulnerabilities; this is not a security audit guarantee.
- No public GitHub repository, deployment, payment integration or human review exists.
- PROMPTS.md still requires the user's authentic full conversation export/link. No reconstructed transcript was fabricated.
- Frontend component coverage remains below 85%; E2E covers the principal management flow but does not replace a full accessibility audit or multi-browser/device matrix.
- Administrator absolute quantity edits are documented last-writer-wins stock corrections; optimistic version checks are not implemented.
- No purchase idempotency key, refresh tokens, shared production rate-limit store, password-reset/email-verification workflow or purchase-history UI.
- Seed/bootstrap and process shutdown have been exercised as tooling, not included in the measured API source coverage.

The submission is locally built and verified within this scope; production readiness still requires the documented operational and security review.
