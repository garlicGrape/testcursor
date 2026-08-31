from typing import List


def max_profit(prices: List[int]) -> int:
    lowest = prices[0]
    best = 0
    for p in prices[1:]:
        best = max(best, p - lowest)
        lowest = min(lowest, p)
    return best
