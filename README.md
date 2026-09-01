# Interview Dojo

Gamified LeetCode practice for **job interviews**. Use it in the browser on GitHub Pages — you do not have to run anything locally for the dashboard.

## Use it hosted (no local install)

The `pages` workflow publishes a static build to the `gh-pages` branch (it does **not** use `actions/deploy-pages`, which 404s until Pages is already on).

Turn the site on once:

1. Repo **Settings → Pages**
2. **Build and deployment → Source:** Deploy from a branch
3. **Branch:** `gh-pages` / `/ (root)` → Save
4. Open **https://garlicgrape.github.io/testcursor/**

Later pushes to `main` rebuild `gh-pages` automatically.

Your XP, streak, and badges live in **this browser** (`localStorage`). They do not sync across phones unless you use the same browser profile.

**Code in the app:** every problem has a Python editor and hidden tests (Pyodide in a Web Worker). **Run** checks tests. **Submit** banks XP only when they all pass. First load downloads a Python runtime from jsDelivr (~10s). The CLI (`python -m dojo solve`) is still available locally.

## Or run it locally

```bash
python3 -m pip install -r requirements.txt
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What you should actually do

1. **Do the daily loop (about 45–70 minutes)**
   - One **new** problem from Practice (or the recommended card on the board).
   - One **pattern** guide in Patterns — mark it studied when you can recap the template from memory.
   - One **review**: re-solve a previous problem with the tab closed.

2. **Use the Cursor coach, not ChatGPT-paste**
   Open the starter in `problems/<id>/solution.py` and say:
   > Coach me on pair-sum for a phone screen. Do not give me the solution. Ask me for the pattern and complexity first.

   The repo rule in `.cursor/rules/interview-coach.mdc` keeps the agent in Socratic mode. Spoilers live in `spoilers/` — do not open that folder.

3. **Bank XP when tests pass**
   Write the function in the in-app editor and click **Submit**. Optional local CLI:
   ```bash
   python -m dojo solve pair-sum
   python -m dojo status
   python -m dojo hint pair-sum
   ```

4. **Study on purpose**
   The Study tab is a library for the rest of the loop: NeetCode roadmap, Grind 75, SQL (DS rounds), stats, ML system design, behavioral STAR, mock interviews. Coding is necessary; it is not the whole interview.

## How the game works

| Action | Reward |
| --- | --- |
| First solve, 0 hints | Full XP (100 / 200 / 350 by difficulty) |
| 1 / 2 / 3+ hints | 85% / 70% / 50% |
| Peeked at a full solution | 25% |
| Daily quest claimed | +20–30 XP |
| Pattern marked studied | +35–70 XP |
| Badges | Extra XP the first time they unlock |

Ranks follow the interview pipeline: Applicant → OA Ready → Phone Screen → Onsite → Offer Loop → Staff Candidate → Hired.

Every catalog problem is runnable in the browser editor. Local `pytest` copies still live under `problems/` if you prefer the CLI. Official LeetCode slugs are linked for the real site.

## Project map

```
src/app          dashboard (Next.js)
src/data         catalog, resources, ranks
problems/        your solutions + tests
spoilers/        reference answers for CI — ignore while practicing
dojo/            CLI XP ledger
AGENTS.md        coach protocol (also used by Cursor)
```

## Tests

```bash
npm test
npm run build
python -m pytest
```
