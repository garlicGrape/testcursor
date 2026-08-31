from pathlib import Path

import pytest

SPOILERS = Path(__file__).resolve().parent.parent / "spoilers"


def test_pair_sum_spoiler():
    from spoilers.pair_sum import two_sum

    assert sorted(two_sum([2, 7, 11, 15], 9)) == [0, 1]
    assert sorted(two_sum([3, 2, 4], 6)) == [1, 2]
    assert sorted(two_sum([3, 3], 6)) == [0, 1]


def test_seen_before_spoiler():
    from spoilers.seen_before import contains_duplicate

    assert contains_duplicate([1, 2, 3, 1]) is True
    assert contains_duplicate([1, 2, 3, 4]) is False


def test_letter_twins_spoiler():
    from spoilers.letter_twins import is_anagram

    assert is_anagram("anagram", "nagaram") is True
    assert is_anagram("rat", "car") is False


def test_mirror_string_spoiler():
    from spoilers.mirror_string import is_palindrome

    assert is_palindrome("A man, a plan, a canal: Panama") is True
    assert is_palindrome("race a car") is False
    assert is_palindrome(" ") is True


def test_bracket_stack_spoiler():
    from spoilers.bracket_stack import is_valid

    assert is_valid("()[]{}") is True
    assert is_valid("(]") is False
    assert is_valid("([)]") is False
    assert is_valid("{[]}") is True


def test_climb_steps_spoiler():
    from spoilers.climb_steps import climb_stairs

    assert climb_stairs(2) == 2
    assert climb_stairs(3) == 3
    assert climb_stairs(5) == 8


def test_buy_sell_spoiler():
    from spoilers.buy_sell_once import max_profit

    assert max_profit([7, 1, 5, 3, 6, 4]) == 5
    assert max_profit([7, 6, 4, 3, 1]) == 0


def test_max_water_spoiler():
    from spoilers.max_water import max_area

    assert max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]) == 49
    assert max_area([1, 1]) == 1


def test_rob_houses_spoiler():
    from spoilers.rob_houses import rob

    assert rob([1, 2, 3, 1]) == 4
    assert rob([2, 7, 9, 3, 1]) == 12
    assert rob([2, 1]) == 2


def test_merge_ranges_spoiler():
    from spoilers.merge_ranges import merge

    assert merge([[1, 3], [2, 6], [8, 10], [15, 18]]) == [[1, 6], [8, 10], [15, 18]]
    assert merge([[1, 4], [4, 5]]) == [[1, 5]]


def test_island_count_spoiler():
    from spoilers.island_count import num_islands

    grid = [
        ["1", "1", "0"],
        ["1", "1", "0"],
        ["0", "0", "1"],
    ]
    assert num_islands([row[:] for row in grid]) == 2


def test_invert_tree_spoiler():
    from spoilers.invert_tree import TreeNode, invert_tree

    root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(7, TreeNode(6), TreeNode(9)))
    out = invert_tree(root)
    assert out.val == 4
    assert out.left.val == 7
    assert out.right.val == 2
    assert out.left.left.val == 9
    assert out.right.right.val == 1
