from solution import is_palindrome


def test_sentence():
    assert is_palindrome("A man, a plan, a canal: Panama") is True


def test_false():
    assert is_palindrome("race a car") is False


def test_space():
    assert is_palindrome(" ") is True
