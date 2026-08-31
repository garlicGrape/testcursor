from typing import List


def rob(nums: List[int]) -> int:
    prev = curr = 0
    for x in nums:
        prev, curr = curr, max(curr, prev + x)
    return curr
