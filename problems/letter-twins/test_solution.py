from solution import is_anagram


def test_true():
    assert is_anagram("anagram", "nagaram") is True


def test_false():
    assert is_anagram("rat", "car") is False


def test_length_mismatch():
    assert is_anagram("ab", "a") is False
