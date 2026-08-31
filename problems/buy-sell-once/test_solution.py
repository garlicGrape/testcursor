from solution import max_profit


def test_profit():
    assert max_profit([7, 1, 5, 3, 6, 4]) == 5


def test_decreasing():
    assert max_profit([7, 6, 4, 3, 1]) == 0


def test_single():
    assert max_profit([2]) == 0
