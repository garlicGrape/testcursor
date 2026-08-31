from __future__ import annotations

import json
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
PROGRESS_PATH = ROOT / "data" / "progress.json"
CATALOG_PATH = ROOT / "data" / "catalog.json"

XP_PER_LEVEL = 400
DIFFICULTY_XP = {"easy": 100, "medium": 200, "hard": 350}

ACHIEVEMENTS = {
    "first-blood": 25,
    "streak-3": 40,
    "streak-7": 80,
    "streak-30": 200,
    "easy-5": 40,
    "medium-5": 70,
    "hard-1": 80,
    "hashing-3": 50,
    "window-3": 50,
    "graph-2": 50,
    "dp-2": 60,
    "no-hints": 40,
    "local-runner": 30,
    "scholar": 50,
    "librarian": 30,
    "reviewer": 45,
    "catalog-12": 100,
}


def empty_progress() -> dict[str, Any]:
    return {
        "xp": 0,
        "streak": 0,
        "lastActiveDate": None,
        "solved": {},
        "studied": {},
        "resourcesRead": [],
        "achievements": [],
        "questLog": {},
        "reviewCount": 0,
    }


def load_progress() -> dict[str, Any]:
    if not PROGRESS_PATH.exists():
        return empty_progress()
    data = json.loads(PROGRESS_PATH.read_text())
    base = empty_progress()
    base.update(data)
    return base


def save_progress(progress: dict[str, Any]) -> None:
    PROGRESS_PATH.parent.mkdir(parents=True, exist_ok=True)
    PROGRESS_PATH.write_text(json.dumps(progress, indent=2) + "\n")


def load_catalog() -> list[dict[str, Any]]:
    if CATALOG_PATH.exists():
        return json.loads(CATALOG_PATH.read_text())
    # Fallback: scan local problem folders
    problems = []
    for folder in sorted((ROOT / "problems").glob("*")):
        meta = folder / "meta.json"
        if meta.exists():
            problems.append(json.loads(meta.read_text()))
    return problems


def today_stamp(now: datetime | None = None) -> str:
    now = now or datetime.now(timezone.utc)
    return now.date().isoformat()


def level_from_xp(xp: int) -> int:
    return 1 + max(0, xp) // XP_PER_LEVEL


def hint_multiplier(hints_used: int, peeked: bool) -> float:
    if peeked:
        return 0.25
    if hints_used <= 0:
        return 1.0
    if hints_used == 1:
        return 0.85
    if hints_used == 2:
        return 0.7
    return 0.5


def xp_for_solve(problem: dict[str, Any], hints_used: int, peeked: bool) -> int:
    base = int(problem.get("xp") or DIFFICULTY_XP[problem["difficulty"]])
    return max(10, round(base * hint_multiplier(hints_used, peeked)))


def bump_streak(progress: dict[str, Any], today: str | None = None) -> dict[str, Any]:
    today = today or today_stamp()
    if progress.get("lastActiveDate") == today:
        return progress
    yday = (date.fromisoformat(today) - timedelta(days=1)).isoformat()
    progress["streak"] = progress["streak"] + 1 if progress.get("lastActiveDate") == yday else 1
    progress["lastActiveDate"] = today
    return progress


def _count(progress: dict[str, Any], catalog: list[dict[str, Any]], pred) -> int:
    solved = progress.get("solved") or {}
    return sum(1 for p in catalog if p["id"] in solved and pred(p))


def evaluate_achievements(progress: dict[str, Any], catalog: list[dict[str, Any]]) -> list[str]:
    unlocked = set(progress.get("achievements") or [])
    solved = progress.get("solved") or {}
    if solved:
        unlocked.add("first-blood")
    if progress.get("streak", 0) >= 3:
        unlocked.add("streak-3")
    if progress.get("streak", 0) >= 7:
        unlocked.add("streak-7")
    if progress.get("streak", 0) >= 30:
        unlocked.add("streak-30")
    if _count(progress, catalog, lambda p: p["difficulty"] == "easy") >= 5:
        unlocked.add("easy-5")
    if _count(progress, catalog, lambda p: p["difficulty"] == "medium") >= 5:
        unlocked.add("medium-5")
    if _count(progress, catalog, lambda p: p["difficulty"] == "hard") >= 1:
        unlocked.add("hard-1")
    if _count(progress, catalog, lambda p: p.get("pattern") == "hashing") >= 3:
        unlocked.add("hashing-3")
    if _count(progress, catalog, lambda p: p.get("pattern") == "sliding-window") >= 3:
        unlocked.add("window-3")
    if _count(progress, catalog, lambda p: p.get("pattern") == "graphs") >= 2:
        unlocked.add("graph-2")
    if _count(progress, catalog, lambda p: p.get("pattern") == "dp") >= 2:
        unlocked.add("dp-2")
    for pid, rec in solved.items():
        problem = next((p for p in catalog if p["id"] == pid), None)
        if (
            problem
            and problem["difficulty"] == "medium"
            and rec.get("hintsUsed", 0) == 0
            and not rec.get("peekedSolution")
        ):
            unlocked.add("no-hints")
            break
    if any(rec.get("localPass") for rec in solved.values()):
        unlocked.add("local-runner")
    if len(progress.get("studied") or {}) >= 4:
        unlocked.add("scholar")
    if len(progress.get("resourcesRead") or []) >= 5:
        unlocked.add("librarian")
    if progress.get("reviewCount", 0) >= 3:
        unlocked.add("reviewer")
    if len(solved) >= 12:
        unlocked.add("catalog-12")
    return sorted(unlocked)


def grant_achievements(progress: dict[str, Any], catalog: list[dict[str, Any]]) -> list[str]:
    before = set(progress.get("achievements") or [])
    all_ids = evaluate_achievements(progress, catalog)
    newly = [i for i in all_ids if i not in before]
    for i in newly:
        progress["xp"] = progress.get("xp", 0) + ACHIEVEMENTS.get(i, 0)
    progress["achievements"] = all_ids
    return newly


def record_solve(
    progress: dict[str, Any],
    problem: dict[str, Any],
    *,
    hints_used: int,
    peeked: bool,
    local_pass: bool,
    now: datetime | None = None,
) -> tuple[dict[str, Any], int, bool, list[str]]:
    catalog = load_catalog()
    today = today_stamp(now)
    first = problem["id"] not in progress.get("solved", {})
    bump_streak(progress, today)
    xp = xp_for_solve(problem, hints_used, peeked) if first else 0
    if first:
        progress.setdefault("solved", {})[problem["id"]] = {
            "solvedAt": today,
            "attempts": 1,
            "hintsUsed": hints_used,
            "peekedSolution": peeked,
            "xpEarned": xp,
            "localPass": local_pass,
        }
        progress["xp"] = progress.get("xp", 0) + xp
    else:
        rec = progress["solved"][problem["id"]]
        rec["attempts"] = rec.get("attempts", 0) + 1
        rec["localPass"] = rec.get("localPass", False) or local_pass
    newly = grant_achievements(progress, catalog)
    return progress, xp, first, newly
