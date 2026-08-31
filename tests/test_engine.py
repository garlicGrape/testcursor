import json
from pathlib import Path

from dojo import engine


def test_empty_level():
    assert engine.level_from_xp(0) == 1
    assert engine.level_from_xp(400) == 2


def test_streak_reset_and_increment():
    p = engine.empty_progress()
    p["streak"] = 4
    p["lastActiveDate"] = "2026-08-20"
    engine.bump_streak(p, "2026-08-22")
    assert p["streak"] == 1
    engine.bump_streak(p, "2026-08-23")
    assert p["streak"] == 2


def test_hint_multiplier():
    assert engine.hint_multiplier(0, False) == 1.0
    assert engine.hint_multiplier(0, True) == 0.25
    assert engine.xp_for_solve({"xp": 200, "difficulty": "medium"}, 3, False) == 100


def test_record_solve_first_blood(tmp_path, monkeypatch):
    catalog = [{"id": "pair-sum", "difficulty": "easy", "pattern": "hashing", "xp": 100, "title": "Pair Sum"}]
    monkeypatch.setattr(engine, "PROGRESS_PATH", tmp_path / "progress.json")
    monkeypatch.setattr(engine, "load_catalog", lambda: catalog)
    progress, xp, first, newly = engine.record_solve(
        engine.empty_progress(),
        catalog[0],
        hints_used=0,
        peeked=False,
        local_pass=True,
    )
    assert first is True
    assert xp == 100
    assert "first-blood" in newly
    assert "local-runner" in newly
