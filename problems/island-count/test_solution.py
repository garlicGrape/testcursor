from solution import num_islands


def test_two_islands():
    grid = [
        ["1", "1", "0"],
        ["1", "1", "0"],
        ["0", "0", "1"],
    ]
    assert num_islands(grid) == 2


def test_empty_water():
    assert num_islands([["0", "0"], ["0", "0"]]) == 0
