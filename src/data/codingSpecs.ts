import { casesToTests, type CodingSpec } from "@/lib/harness";
import { GRIND_CODING } from "./grindSpecs";

export const LIST_HELPERS = `from typing import List, Optional

class ListNode:
    def __init__(self, val: int = 0, next: Optional["ListNode"] = None):
        self.val = val
        self.next = next

def _from_list(arr):
    dummy = ListNode(0)
    cur = dummy
    for x in arr:
        cur.next = ListNode(x)
        cur = cur.next
    return dummy.next

def _to_list(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out
`;

export const TREE_HELPERS = `from typing import Optional, List

class TreeNode:
    def __init__(self, val: int = 0, left: Optional["TreeNode"] = None, right: Optional["TreeNode"] = None):
        self.val = val
        self.left = left
        self.right = right

def _tree(arr):
    if not arr:
        return None
    root = TreeNode(arr[0])
    q = [root]
    i = 1
    while q and i < len(arr):
        node = q.pop(0)
        if i < len(arr):
            if arr[i] is not None:
                node.left = TreeNode(arr[i])
                q.append(node.left)
            i += 1
        if i < len(arr):
            if arr[i] is not None:
                node.right = TreeNode(arr[i])
                q.append(node.right)
            i += 1
    return root

def _vals(root):
    if not root:
        return []
    out, q = [], [root]
    while q:
        n = q.pop(0)
        out.append(n.val)
        if n.left:
            q.append(n.left)
        if n.right:
            q.append(n.right)
    return out
`;

export function spec(
  starter: string,
  cases: { name: string; got: string; want: string }[],
  preamble = "",
): CodingSpec {
  return { starter, tests: casesToTests(cases, preamble) };
}

export const CODING: Record<string, CodingSpec> = {
  "pair-sum": spec(
    `from typing import List

def two_sum(nums: List[int], target: int) -> List[int]:
    """Return indices of the two numbers that add to target."""
    pass
`,
    [
      { name: "example 1", got: "sorted(two_sum([2, 7, 11, 15], 9))", want: "[0, 1]" },
      { name: "example 2", got: "sorted(two_sum([3, 2, 4], 6))", want: "[1, 2]" },
      { name: "duplicates", got: "sorted(two_sum([3, 3], 6))", want: "[0, 1]" },
      { name: "negatives", got: "sorted(two_sum([-1, 4, 5, 0], 4))", want: "[0, 2]" },
    ],
  ),
  "seen-before": spec(
    `from typing import List

def contains_duplicate(nums: List[int]) -> bool:
    """True if any value appears at least twice."""
    pass
`,
    [
      { name: "has dup", got: "contains_duplicate([1, 2, 3, 1])", want: "True" },
      { name: "unique", got: "contains_duplicate([1, 2, 3, 4])", want: "False" },
      { name: "single", got: "contains_duplicate([1])", want: "False" },
    ],
  ),
  "letter-twins": spec(
    `def is_anagram(s: str, t: str) -> bool:
    """True if t is an anagram of s."""
    pass
`,
    [
      { name: "true", got: 'is_anagram("anagram", "nagaram")', want: "True" },
      { name: "false", got: 'is_anagram("rat", "car")', want: "False" },
      { name: "length", got: 'is_anagram("ab", "a")', want: "False" },
    ],
  ),
  "group-anagrams": spec(
    `from typing import List

def group_anagrams(strs: List[str]) -> List[List[str]]:
    """Group anagrams. Order of groups and of words inside a group does not matter."""
    pass
`,
    [
      {
        name: "example",
        got: "sorted(tuple(sorted(g)) for g in group_anagrams(['eat','tea','tan','ate','nat','bat']))",
        want: "sorted([tuple(sorted(g)) for g in [['eat','tea','ate'],['tan','nat'],['bat']]])",
      },
    ],
  ),
  "top-k-frequent": spec(
    `from typing import List

def top_k_frequent(nums: List[int], k: int) -> List[int]:
    """The k most frequent values. Order does not matter."""
    pass
`,
    [
      { name: "example", got: "sorted(top_k_frequent([1,1,1,2,2,3], 2))", want: "[1, 2]" },
      { name: "one", got: "top_k_frequent([1], 1)", want: "[1]" },
    ],
  ),
  "mirror-string": spec(
    `def is_palindrome(s: str) -> bool:
    """True if s is a palindrome after ignoring non-alphanumerics and case."""
    pass
`,
    [
      { name: "sentence", got: 'is_palindrome("A man, a plan, a canal: Panama")', want: "True" },
      { name: "false", got: 'is_palindrome("race a car")', want: "False" },
      { name: "space", got: 'is_palindrome(" ")', want: "True" },
    ],
  ),
  "three-sum": spec(
    `from typing import List

def three_sum(nums: List[int]) -> List[List[int]]:
    """Unique triplets that add to zero. Order of triplets does not matter."""
    pass
`,
    [
      {
        name: "example",
        got: "sorted(sorted(t) for t in three_sum([-1, 0, 1, 2, -1, -4]))",
        want: "[[-1, -1, 2], [-1, 0, 1]]",
      },
      { name: "none", got: "three_sum([0, 1, 1])", want: "[]" },
    ],
  ),
  "max-water": spec(
    `from typing import List

def max_area(height: List[int]) -> int:
    """Maximum water area between two lines."""
    pass
`,
    [
      { name: "example", got: "max_area([1,8,6,2,5,4,8,3,7])", want: "49" },
      { name: "two", got: "max_area([1, 1])", want: "1" },
    ],
  ),
  "buy-sell-once": spec(
    `from typing import List

def max_profit(prices: List[int]) -> int:
    """Max profit from one buy and one later sell."""
    pass
`,
    [
      { name: "profit", got: "max_profit([7,1,5,3,6,4])", want: "5" },
      { name: "decreasing", got: "max_profit([7,6,4,3,1])", want: "0" },
      { name: "single", got: "max_profit([2])", want: "0" },
    ],
  ),
  "longest-unique-window": spec(
    `def length_of_longest_substring(s: str) -> int:
    """Length of the longest substring with all unique characters."""
    pass
`,
    [
      { name: "abcabcbb", got: 'length_of_longest_substring("abcabcbb")', want: "3" },
      { name: "bbbbb", got: 'length_of_longest_substring("bbbbb")', want: "1" },
      { name: "pwwkew", got: 'length_of_longest_substring("pwwkew")', want: "3" },
      { name: "empty", got: 'length_of_longest_substring("")', want: "0" },
    ],
  ),
  "min-window": spec(
    `def min_window(s: str, t: str) -> str:
    """Shortest substring of s that covers every character of t."""
    pass
`,
    [
      { name: "example", got: 'min_window("ADOBECODEBANC", "ABC")', want: '"BANC"' },
      { name: "none", got: 'min_window("a", "aa")', want: '""' },
    ],
  ),
  "bracket-stack": spec(
    `def is_valid(s: str) -> bool:
    """True if brackets are closed in the correct order."""
    pass
`,
    [
      { name: "mixed", got: 'is_valid("()[]{}")', want: "True" },
      { name: "wrong pair", got: 'is_valid("(]")', want: "False" },
      { name: "nested", got: 'is_valid("{[]}")', want: "True" },
      { name: "interleaved", got: 'is_valid("([)]")', want: "False" },
    ],
  ),
  "daily-temperatures": spec(
    `from typing import List

def daily_temperatures(temperatures: List[int]) -> List[int]:
    """Days until a strictly warmer temperature (0 if none)."""
    pass
`,
    [
      {
        name: "example",
        got: "daily_temperatures([73,74,75,71,69,72,76,73])",
        want: "[1, 1, 4, 2, 1, 1, 0, 0]",
      },
    ],
  ),
  "rotated-search": spec(
    `from typing import List

def search_rotated(nums: List[int], target: int) -> int:
    """Index of target in a rotated sorted array, or -1."""
    pass
`,
    [
      { name: "found", got: "search_rotated([4,5,6,7,0,1,2], 0)", want: "4" },
      { name: "missing", got: "search_rotated([4,5,6,7,0,1,2], 3)", want: "-1" },
      { name: "unrotated", got: "search_rotated([1,2,3], 2)", want: "1" },
    ],
  ),
  "reverse-list": spec(
    `${LIST_HELPERS}

def reverse_list(head: Optional[ListNode]) -> Optional[ListNode]:
    """Reverse a singly linked list and return the new head."""
    pass
`,
    [
      { name: "five", got: "_to_list(reverse_list(_from_list([1,2,3,4,5])))", want: "[5, 4, 3, 2, 1]" },
      { name: "empty", got: "_to_list(reverse_list(_from_list([])))", want: "[]" },
      { name: "one", got: "_to_list(reverse_list(_from_list([1])))", want: "[1]" },
    ],
    LIST_HELPERS,
  ),
  "cycle-detect": spec(
    `${LIST_HELPERS}

def has_cycle(head: Optional[ListNode]) -> bool:
    """True if the linked list contains a cycle."""
    pass
`,
    [
      { name: "has cycle", got: "has_cycle(_cyc())", want: "True" },
      { name: "no cycle", got: "has_cycle(_from_list([1,2,3]))", want: "False" },
      { name: "empty", got: "has_cycle(None)", want: "False" },
    ],
    `${LIST_HELPERS}

def _cyc():
    h = _from_list([3, 2, 0, -4])
    h.next.next.next.next = h.next
    return h
`,
  ),
  "invert-tree": spec(
    `${TREE_HELPERS}

def invert_tree(root: Optional[TreeNode]) -> Optional[TreeNode]:
    """Swap every left and right child. Return the root."""
    pass
`,
    [
      { name: "example", got: "_vals(invert_tree(_tree([4,2,7,1,3,6,9])))", want: "[4, 7, 2, 9, 6, 3, 1]" },
      { name: "empty", got: "invert_tree(None)", want: "None" },
    ],
    TREE_HELPERS,
  ),
  "level-order": spec(
    `${TREE_HELPERS}

def level_order(root: Optional[TreeNode]) -> List[List[int]]:
    """Node values grouped by level, left to right."""
    pass
`,
    [
      {
        name: "example",
        got: "level_order(_tree([3,9,20,None,None,15,7]))",
        want: "[[3], [9, 20], [15, 7]]",
      },
      { name: "empty", got: "level_order(None)", want: "[]" },
    ],
    TREE_HELPERS,
  ),
  "lca-bst": spec(
    `${TREE_HELPERS}

def lca(root: TreeNode, p: int, q: int) -> int:
    """Value of the lowest common ancestor of nodes p and q in a BST."""
    pass
`,
    [
      { name: "split", got: "lca(_tree([6,2,8,0,4,7,9]), 2, 8)", want: "6" },
      { name: "left", got: "lca(_tree([6,2,8,0,4,7,9]), 2, 4)", want: "2" },
    ],
    TREE_HELPERS,
  ),
  "island-count": spec(
    `from typing import List

def num_islands(grid: List[List[str]]) -> int:
    """Count 4-connected groups of '1' in the grid."""
    pass
`,
    [
      {
        name: "two islands",
        got: "num_islands([['1','1','0'],['1','1','0'],['0','0','1']])",
        want: "2",
      },
      { name: "water", got: "num_islands([['0','0'],['0','0']])", want: "0" },
    ],
  ),
  "course-order": spec(
    `from typing import List

def can_finish(num_courses: int, prerequisites: List[List[int]]) -> bool:
    """True if you can finish every course given [a, b] = b before a."""
    pass
`,
    [
      { name: "ok", got: "can_finish(2, [[1, 0]])", want: "True" },
      { name: "cycle", got: "can_finish(2, [[1, 0], [0, 1]])", want: "False" },
    ],
  ),
  "climb-steps": spec(
    `def climb_stairs(n: int) -> int:
    """Number of ways to climb n steps taking 1 or 2 at a time."""
    pass
`,
    [
      { name: "two", got: "climb_stairs(2)", want: "2" },
      { name: "three", got: "climb_stairs(3)", want: "3" },
      { name: "five", got: "climb_stairs(5)", want: "8" },
    ],
  ),
  "rob-houses": spec(
    `from typing import List

def rob(nums: List[int]) -> int:
    """Max loot without robbing adjacent houses."""
    pass
`,
    [
      { name: "example 1", got: "rob([1,2,3,1])", want: "4" },
      { name: "example 2", got: "rob([2,7,9,3,1])", want: "12" },
      { name: "two", got: "rob([2,1])", want: "2" },
    ],
  ),
  "coin-change": spec(
    `from typing import List

def coin_change(coins: List[int], amount: int) -> int:
    """Fewest coins to make amount, or -1."""
    pass
`,
    [
      { name: "example", got: "coin_change([1, 2, 5], 11)", want: "3" },
      { name: "impossible", got: "coin_change([2], 3)", want: "-1" },
      { name: "zero", got: "coin_change([1], 0)", want: "0" },
    ],
  ),
  "merge-ranges": spec(
    `from typing import List

def merge(intervals: List[List[int]]) -> List[List[int]]:
    """Merge overlapping intervals."""
    pass
`,
    [
      { name: "overlap", got: "merge([[1,3],[2,6],[8,10],[15,18]])", want: "[[1, 6], [8, 10], [15, 18]]" },
      { name: "touching", got: "merge([[1,4],[4,5]])", want: "[[1, 5]]" },
    ],
  ),
  "time-counters": spec(
    `class HitCounter:
    def __init__(self):
        pass

    def hit(self, timestamp: int) -> None:
        """Record a hit at timestamp (seconds)."""
        pass

    def getHits(self, timestamp: int) -> int:
        """Hits in the past 300 seconds, inclusive of timestamp."""
        return 0
`,
    [{ name: "window", got: "_run_hits()", want: "(3, 4, 3)" }],
    `def _run_hits():
    c = HitCounter()
    c.hit(1)
    c.hit(2)
    c.hit(3)
    a = c.getHits(4)
    c.hit(300)
    return a, c.getHits(300), c.getHits(301)
`,
  ),
  bishop: spec(
    `def bishop_moves(r1: int, c1: int, r2: int, c2: int) -> int:
    """Min bishop moves on an infinite board. -1 if opposite colors."""
    pass
`,
    [
      { name: "same square", got: "bishop_moves(1, 1, 1, 1)", want: "0" },
      { name: "diagonal", got: "bishop_moves(1, 1, 3, 3)", want: "1" },
      { name: "two moves", got: "bishop_moves(1, 1, 2, 4)", want: "2" },
      { name: "impossible", got: "bishop_moves(1, 1, 1, 2)", want: "-1" },
    ],
  ),
  "creating-a-maze": spec(
    `from typing import List

def create_maze(n: int) -> List[List[str]]:
    """Return an n x n maze of '#' walls and '.' open cells with a unique path from (0,0) to (n-1,n-1)."""
    pass
`,
    [
      { name: "n=1", got: "_unique_paths(create_maze(1), 1)", want: "1" },
      { name: "n=2 unique", got: "_unique_paths(create_maze(2), 2)", want: "1" },
      { name: "n=3 unique", got: "_unique_paths(create_maze(3), 3)", want: "1" },
    ],
    `def _unique_paths(grid, n):
    if not grid or len(grid) != n or any(len(row) != n for row in grid):
        return 0
    if any(cell not in '.#' for row in grid for cell in row):
        return 0
    if grid[0][0] != '.' or grid[n - 1][n - 1] != '.':
        return 0
    seen = [[False] * n for _ in range(n)]
    paths = [0]
    def dfs(r, c):
        if r < 0 or c < 0 or r >= n or c >= n or grid[r][c] != '.' or seen[r][c]:
            return
        if r == n - 1 and c == n - 1:
            paths[0] += 1
            return
        seen[r][c] = True
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            dfs(r + dr, c + dc)
        seen[r][c] = False
    dfs(0, 0)
    return paths[0]
`,
  ),
  "letter-dice": spec(
    `from typing import List

def can_spell(dice: List[str], word: str) -> bool:
    """Each dice[i] is a row of letters. True if word exists on the board (4-adjacent, no reuse)."""
    pass
`,
    [
      { name: "CAT", got: 'can_spell(["HET", "CAT", "DOG"], "CAT")', want: "True" },
      { name: "ADI", got: 'can_spell(["ABC", "DEF", "GHI"], "ADI")', want: "False" },
      { name: "ABC", got: 'can_spell(["ABC", "DEF", "GHI"], "ABC")', want: "True" },
    ],
  ),
  "closest-c-bst": spec(
    `${TREE_HELPERS}

def closest_values(root: TreeNode, target: float, c: int) -> List[int]:
    """C BST values closest to target (any order)."""
    pass
`,
    [
      {
        name: "example",
        got: "sorted(closest_values(_tree([4, 2, 5, 1, 3]), 3.714, 2))",
        want: "[3, 4]",
      },
    ],
    TREE_HELPERS,
  ),
  "majority-value": spec(
    `from typing import List

def majority_element(nums: List[int]) -> int:
    """The value that appears more than n/2 times."""
    pass
`,
    [
      { name: "threes", got: "majority_element([3, 2, 3])", want: "3" },
      { name: "twos", got: "majority_element([2, 2, 1, 1, 1, 2, 2])", want: "2" },
    ],
  ),
  abbreviations: spec(
    `from typing import List

def generate_abbreviations(word: str) -> List[str]:
    """Every generalized abbreviation of word (any order)."""
    pass
`,
    [
      {
        name: "ab",
        got: "sorted(generate_abbreviations('ab'))",
        want: "sorted(['ab', '1b', 'a1', '2'])",
      },
    ],
  ),
  "merge-k": spec(
    `${LIST_HELPERS}

def merge_k_lists(lists: List[Optional[ListNode]]) -> Optional[ListNode]:
    """Merge k sorted linked lists."""
    pass
`,
    [
      {
        name: "three lists",
        got: "_to_list(merge_k_lists([_from_list([1,4,5]), _from_list([1,3,4]), _from_list([2,6])]))",
        want: "[1, 1, 2, 3, 4, 4, 5, 6]",
      },
      { name: "empty", got: "_to_list(merge_k_lists([]))", want: "[]" },
    ],
    LIST_HELPERS,
  ),
  "rate-limiter": spec(
    `class Logger:
    def __init__(self):
        pass

    def shouldPrintMessage(self, timestamp: int, message: str) -> bool:
        """True if this message was not printed in the previous 10 seconds."""
        return True
`,
    [
      {
        name: "sequence",
        got: "_run_logger()",
        want: "[True, True, False, False, False, True]",
      },
    ],
    `def _run_logger():
    lg = Logger()
    return [lg.shouldPrintMessage(t, m) for t, m in [(1, "foo"), (2, "bar"), (3, "foo"), (8, "bar"), (10, "foo"), (11, "foo")]]
`,
  ),
  "pots-of-gold": spec(
    `from typing import List

def pots_of_gold(pots: List[int]) -> int:
    """Max coins the first player can guarantee (take from either end each turn)."""
    pass
`,
    [
      { name: "example", got: "pots_of_gold([8, 15, 3, 7])", want: "22" },
      { name: "small", got: "pots_of_gold([1, 5, 2])", want: "3" },
    ],
  ),
  "friend-suggest": spec(
    `from typing import List

def friend_suggest(n: int, edges: List[List[int]], u: int, k: int) -> List[int]:
    """Top k non-friends of u ranked by mutual friends (common neighbors)."""
    pass
`,
    [
      { name: "one hop", got: "friend_suggest(4, [[0, 1], [0, 2], [1, 3]], 0, 1)", want: "[3]" },
    ],
  ),
  "stock-two-tx": spec(
    `from typing import List

def max_profit_two(prices: List[int]) -> int:
    """Max profit with at most two transactions."""
    pass
`,
    [
      { name: "example", got: "max_profit_two([3, 3, 5, 0, 0, 3, 1, 4])", want: "6" },
      { name: "rising", got: "max_profit_two([1, 2, 3, 4, 5])", want: "4" },
    ],
  ),
  "bounded-sort": spec(
    `from typing import List

def sort_colors(nums: List[int]) -> None:
    """Sort nums of 0/1/2 in place. Mutate nums; return None."""
    pass
`,
    [{ name: "example", got: "_run_colors()", want: "[0, 0, 1, 1, 2, 2]" }],
    `def _run_colors():
    nums = [2, 0, 2, 1, 1, 0]
    sort_colors(nums)
    return nums
`,
  ),
  "rle-encoding": spec(
    `from typing import List

def compress(chars: List[str]) -> int:
    """RLE-encode chars in place. Return the new length. Prefix chars with the encoding."""
    pass
`,
    [{ name: "example", got: "_run_compress()", want: "(6, ['a', '2', 'b', '2', 'c', '3'])" }],
    `def _run_compress():
    chars = list("aabbccc")
    n = compress(chars)
    return n, chars[:n]
`,
  ),
  "palindrome-partition": spec(
    `from typing import List

def partition(s: str) -> List[List[str]]:
    """Every palindrome partition of s (any order)."""
    pass
`,
    [
      {
        name: "aab",
        got: "sorted(tuple(p) for p in partition('aab'))",
        want: "[('a', 'a', 'b'), ('aa', 'b')]",
      },
    ],
  ),
  "words-in-string": spec(
    `from typing import List

def word_break(s: str, word_dict: List[str]) -> List[str]:
    """Every way to insert spaces so each token is in the dictionary (any order)."""
    pass
`,
    [
      {
        name: "catsanddog",
        got: "sorted(word_break('catsanddog', ['cat', 'cats', 'and', 'sand', 'dog']))",
        want: "sorted(['cats and dog', 'cat sand dog'])",
      },
    ],
  ),
  "minimizing-work-days": spec(
    `from typing import List

def least_interval(tasks: List[str], n: int) -> int:
    """Minimum days to finish tasks with cooldown n between identical types."""
    pass
`,
    [{ name: "example", got: "least_interval(['A', 'A', 'A', 'B', 'B', 'B'], 2)", want: "8" }],
  ),
  strobogrammatic: spec(
    `from typing import List

def strobogrammatic(n_len: int) -> List[str]:
    """All strobogrammatic numbers of length n_len (any order). Drop leading zeros except 0 itself."""
    pass
`,
    [
      {
        name: "len 2",
        got: "sorted(strobogrammatic(2))",
        want: "sorted(['11', '69', '88', '96'])",
      },
    ],
  ),
  "noncontiguous-matches": spec(
    `from typing import List

def num_matching_subseq(s: str, words: List[str]) -> int:
    """How many words are subsequences of s."""
    pass
`,
    [{ name: "example", got: 'num_matching_subseq("abcde", ["a", "bb", "acd", "ace"])', want: "3" }],
  ),
};

Object.assign(CODING, GRIND_CODING);

export function getCoding(id: string): CodingSpec | undefined {
  return CODING[id];
}
