from solution import rob


def test_example_one():
    assert rob([1, 2, 3, 1]) == 4


def test_example_two():
    assert rob([2, 7, 9, 3, 1]) == 12


def test_two():
    assert rob([2, 1]) == 2
