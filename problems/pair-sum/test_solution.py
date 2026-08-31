from solution import two_sum


def test_example_one():
    assert sorted(two_sum([2, 7, 11, 15], 9)) == [0, 1]


def test_example_two():
    assert sorted(two_sum([3, 2, 4], 6)) == [1, 2]


def test_duplicates():
    assert sorted(two_sum([3, 3], 6)) == [0, 1]


def test_negatives():
    assert sorted(two_sum([-1, 4, 5, 0], 4)) == [0, 2]
