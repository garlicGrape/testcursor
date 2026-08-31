def is_valid(s: str) -> bool:
    pairs = {"(": ")", "[": "]", "{": "}"}
    stack: list[str] = []
    for ch in s:
        if ch in pairs:
            stack.append(ch)
        else:
            if not stack or pairs[stack[-1]] != ch:
                return False
            stack.pop()
    return not stack
