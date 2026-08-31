import argparse
import json
import subprocess
import sys
from pathlib import Path

from . import engine

ROOT = Path(__file__).resolve().parent.parent
HINT_STATE = ROOT / "data" / "hints.json"


def _hints() -> dict:
    if HINT_STATE.exists():
        return json.loads(HINT_STATE.read_text())
    return {}


def _save_hints(data: dict) -> None:
    HINT_STATE.parent.mkdir(parents=True, exist_ok=True)
    HINT_STATE.write_text(json.dumps(data, indent=2) + "\n")


def _problem(pid: str) -> dict:
    catalog = engine.load_catalog()
    match = next((p for p in catalog if p["id"] == pid), None)
    if not match:
        raise SystemExit(f"Unknown problem '{pid}'. Try: python -m dojo catalog")
    return match


def cmd_status(_: argparse.Namespace) -> None:
    p = engine.load_progress()
    level = engine.level_from_xp(p.get("xp", 0))
    solved = len(p.get("solved") or {})
    print(f"Interview Dojo")
    print(f"  XP      {p.get('xp', 0)}")
    print(f"  Level   {level}")
    print(f"  Streak  {p.get('streak', 0)} day(s)")
    print(f"  Solved  {solved}")
    if p.get("achievements"):
        print("  Badges  " + ", ".join(p["achievements"]))


def cmd_catalog(_: argparse.Namespace) -> None:
    progress = engine.load_progress()
    solved = progress.get("solved") or {}
    for item in engine.load_catalog():
        mark = "x" if item["id"] in solved else " "
        local = " local" if item.get("local") else ""
        print(f"[{mark}] {item['id']:24} {item['difficulty']:6} {item.get('pattern', ''):16} {item['title']}{local}")


def cmd_today(_: argparse.Namespace) -> None:
    print("Today's loop (also shown in the dashboard):")
    print("  1. Solve the recommended problem in /practice")
    print("  2. Study one pattern guide in /learn")
    print("  3. Re-solve a previous problem from memory")
    print()
    print("Run: python -m dojo solve <id>   after tests pass to bank XP")


def cmd_hint(ns: argparse.Namespace) -> None:
    problem = _problem(ns.problem)
    hints = problem.get("hints") or []
    if not hints:
        print("No hints on file. Open the dashboard problem page, or ask the Cursor coach for a Socratic nudge.")
        return
    state = _hints()
    used = state.get(ns.problem, 0)
    n = ns.n if ns.n is not None else used + 1
    n = max(1, min(n, len(hints)))
    state[ns.problem] = max(used, n)
    _save_hints(state)
    print(f"Hint {n}/{len(hints)} for {problem['title']} (XP multiplier will drop on first solve)")
    print(hints[n - 1])


def cmd_solve(ns: argparse.Namespace) -> None:
    problem = _problem(ns.problem)
    folder = ROOT / "problems" / ns.problem
    if not problem.get("local") or not folder.exists():
        print(f"{ns.problem} is not a local pytest problem.")
        slug = (problem.get("leetcode") or {}).get("slug")
        if slug:
            print(f"Closest LeetCode drill: https://leetcode.com/problems/{slug}/")
        print("Mark it solved in the dashboard (Practice → problem → I solved it).")
        return
    result = subprocess.run(
        [sys.executable, "-m", "pytest", str(folder), "-q"],
        cwd=ROOT,
    )
    if result.returncode != 0:
        print("Tests failed. No XP awarded. Ask the coach for a hint, not a paste.")
        raise SystemExit(result.returncode)
    hints_used = _hints().get(ns.problem, 0)
    progress = engine.load_progress()
    progress, xp, first, newly = engine.record_solve(
        progress,
        problem,
        hints_used=hints_used,
        peeked=False,
        local_pass=True,
    )
    engine.save_progress(progress)
    if first:
        print(f"Passed. +{xp} XP  (hints used: {hints_used})")
    else:
        print("Passed again. No additional XP (already solved).")
    if newly:
        print("New badges: " + ", ".join(newly))
    print(f"Total XP {progress['xp']} · level {engine.level_from_xp(progress['xp'])} · streak {progress['streak']}")


def main() -> None:
    parser = argparse.ArgumentParser(prog="dojo", description="Interview Dojo CLI")
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("status").set_defaults(func=cmd_status)
    sub.add_parser("catalog").set_defaults(func=cmd_catalog)
    sub.add_parser("today").set_defaults(func=cmd_today)
    p_solve = sub.add_parser("solve")
    p_solve.add_argument("problem")
    p_solve.set_defaults(func=cmd_solve)
    p_hint = sub.add_parser("hint")
    p_hint.add_argument("problem")
    p_hint.add_argument("n", nargs="?", type=int)
    p_hint.set_defaults(func=cmd_hint)
    ns = parser.parse_args()
    ns.func(ns)


if __name__ == "__main__":
    main()
