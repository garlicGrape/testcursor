from solution import is_valid


def test_mixed():
    assert is_valid("()[]{}") is True


def test_wrong_pair():
    assert is_valid("(]") is False


def test_interleaved():
    assert is_valid("([)]") is False


def test_nested():
    assert is_valid("{[]}") is True
