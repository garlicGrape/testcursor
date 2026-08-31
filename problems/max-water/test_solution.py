from solution import max_area


def test_example():
    assert max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]) == 49


def test_two():
    assert max_area([1, 1]) == 1
