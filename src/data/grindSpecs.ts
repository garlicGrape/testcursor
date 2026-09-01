import { casesToTests, type CodingSpec } from "@/lib/harness";

const LIST_HELPERS = `from typing import List, Optional

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

const TREE_HELPERS = `from typing import Optional, List

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

function spec(
  starter: string,
  cases: { name: string; got: string; want: string }[],
  preamble = "",
): CodingSpec {
  return { starter, tests: casesToTests(cases, preamble) };
}

export const GRIND_CODING: Record<string, CodingSpec> = {
  "product-except-self": spec(
    `from typing import List

def product_except_self(nums: List[int]) -> List[int]:
    """out[i] is the product of every value except nums[i]. No division."""
    pass
`,
    [
      { name: "example", got: "product_except_self([1,2,3,4])", want: "[24, 12, 8, 6]" },
      { name: "with zero", got: "product_except_self([-1,1,0,-3,3])", want: "[0, 0, 9, 0, 0]" },
    ],
  ),
  "max-subarray": spec(
    `from typing import List

def max_subarray(nums: List[int]) -> int:
    """Largest sum of any contiguous subarray."""
    pass
`,
    [
      { name: "example", got: "max_subarray([-2,1,-3,4,-1,2,1,-5,4])", want: "6" },
      { name: "single", got: "max_subarray([-1])", want: "-1" },
    ],
  ),
  "missing-number": spec(
    `from typing import List

def missing_number(nums: List[int]) -> int:
    """Missing value from 0..n inclusive."""
    pass
`,
    [
      { name: "example", got: "missing_number([3,0,1])", want: "2" },
      { name: "last", got: "missing_number([0,1])", want: "2" },
    ],
  ),
  "move-zeroes": spec(
    `from typing import List

def move_zeroes(nums: List[int]) -> None:
    """Move zeroes to the end in place. Keep non-zero order."""
    pass
`,
    [{ name: "example", got: "_run()", want: "[1, 3, 12, 0, 0]" }],
    `def _run():
    nums = [0, 1, 0, 3, 12]
    move_zeroes(nums)
    return nums
`,
  ),
  "longest-consecutive": spec(
    `from typing import List

def longest_consecutive(nums: List[int]) -> int:
    """Length of the longest consecutive streak."""
    pass
`,
    [
      { name: "example", got: "longest_consecutive([100,4,200,1,3,2])", want: "4" },
      { name: "empty", got: "longest_consecutive([])", want: "0" },
    ],
  ),
  "min-stack-lab": spec(
    `class MinStack:
    def __init__(self):
        pass

    def push(self, val: int) -> None:
        pass

    def pop(self) -> None:
        pass

    def top(self) -> int:
        return 0

    def getMin(self) -> int:
        return 0
`,
    [{ name: "sequence", got: "_run()", want: "[-3, 0, -2]" }],
    `def _run():
    s = MinStack()
    s.push(-2)
    s.push(0)
    s.push(-3)
    a = s.getMin()
    s.pop()
    b = s.top()
    c = s.getMin()
    return [a, b, c]
`,
  ),
  "eval-rpn": spec(
    `from typing import List

def eval_rpn(tokens: List[str]) -> int:
    """Evaluate reverse Polish notation. Division truncates toward zero."""
    pass
`,
    [
      { name: "example", got: 'eval_rpn(["2","1","+","3","*"])', want: "9" },
      { name: "div", got: 'eval_rpn(["4","13","5","/","+"])', want: "6" },
    ],
  ),
  "generate-parens": spec(
    `from typing import List

def generate_parenthesis(n: int) -> List[str]:
    """Every valid string of n pairs of parentheses. Any order."""
    pass
`,
    [
      {
        name: "n=3",
        got: "sorted(generate_parenthesis(3))",
        want: "sorted(['((()))','(()())','(())()','()(())','()()()'])",
      },
      { name: "n=1", got: "generate_parenthesis(1)", want: "['()']" },
    ],
  ),
  "koko-bananas": spec(
    `from typing import List

def min_eating_speed(piles: List[int], h: int) -> int:
    """Minimum integer speed to finish all piles in h hours."""
    pass
`,
    [
      { name: "example", got: "min_eating_speed([3,6,7,11], 8)", want: "4" },
      { name: "tight", got: "min_eating_speed([30,11,23,4,20], 5)", want: "30" },
    ],
  ),
  "min-rotated": spec(
    `from typing import List

def find_min(nums: List[int]) -> int:
    """Minimum of a rotated sorted array of distinct values."""
    pass
`,
    [
      { name: "example", got: "find_min([3,4,5,1,2])", want: "1" },
      { name: "unrotated", got: "find_min([1,2,3])", want: "1" },
    ],
  ),
  "search-matrix": spec(
    `from typing import List

def search_matrix(matrix: List[List[int]], target: int) -> bool:
    """True if target is in the row-wise sorted matrix."""
    pass
`,
    [
      { name: "found", got: "search_matrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3)", want: "True" },
      { name: "missing", got: "search_matrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 13)", want: "False" },
    ],
  ),
  "merge-two-lists": spec(
    `${LIST_HELPERS}

def merge_two_lists(l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
    """Merge two sorted lists."""
    pass
`,
    [
      {
        name: "example",
        got: "_to_list(merge_two_lists(_from_list([1,2,4]), _from_list([1,3,4])))",
        want: "[1, 1, 2, 3, 4, 4]",
      },
      { name: "empty", got: "_to_list(merge_two_lists(_from_list([]), _from_list([0])))", want: "[0]" },
    ],
    LIST_HELPERS,
  ),
  "middle-list": spec(
    `${LIST_HELPERS}

def middle_node(head: Optional[ListNode]) -> Optional[ListNode]:
    """Middle node (second middle if even length)."""
    pass
`,
    [
      { name: "odd", got: "_to_list(middle_node(_from_list([1,2,3,4,5])))", want: "[3, 4, 5]" },
      { name: "even", got: "_to_list(middle_node(_from_list([1,2,3,4,5,6])))", want: "[4, 5, 6]" },
    ],
    LIST_HELPERS,
  ),
  "max-depth": spec(
    `${TREE_HELPERS}

def max_depth(root: Optional[TreeNode]) -> int:
    """Longest root-to-leaf path in nodes."""
    pass
`,
    [
      { name: "example", got: "max_depth(_tree([3,9,20,None,None,15,7]))", want: "3" },
      { name: "empty", got: "max_depth(None)", want: "0" },
    ],
    TREE_HELPERS,
  ),
  "same-tree": spec(
    `${TREE_HELPERS}

def is_same_tree(p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
    """True if both trees match in shape and values."""
    pass
`,
    [
      { name: "same", got: "is_same_tree(_tree([1,2,3]), _tree([1,2,3]))", want: "True" },
      { name: "diff", got: "is_same_tree(_tree([1,2]), _tree([1,None,2]))", want: "False" },
    ],
    TREE_HELPERS,
  ),
  "diameter-tree": spec(
    `${TREE_HELPERS}

def diameter(root: Optional[TreeNode]) -> int:
    """Longest path in edges."""
    pass
`,
    [
      { name: "example", got: "diameter(_tree([1,2,3,4,5]))", want: "3" },
      { name: "single", got: "diameter(_tree([1]))", want: "0" },
    ],
    TREE_HELPERS,
  ),
  "validate-bst": spec(
    `${TREE_HELPERS}

def is_valid_bst(root: Optional[TreeNode]) -> bool:
    """True if the tree is a strict BST."""
    pass
`,
    [
      { name: "ok", got: "is_valid_bst(_tree([2,1,3]))", want: "True" },
      { name: "bad", got: "is_valid_bst(_tree([5,1,4,None,None,3,6]))", want: "False" },
    ],
    TREE_HELPERS,
  ),
  "subsets-lab": spec(
    `from typing import List

def subsets(nums: List[int]) -> List[List[int]]:
    """Power set. Order of subsets and of values inside does not matter."""
    pass
`,
    [
      {
        name: "example",
        got: "sorted(tuple(sorted(s)) for s in subsets([1,2,3]))",
        want: "[(), (1,), (1, 2), (1, 2, 3), (1, 3), (2,), (2, 3), (3,)]",
      },
    ],
  ),
  "unique-paths": spec(
    `def unique_paths(m: int, n: int) -> int:
    """Paths from (0,0) to (m-1,n-1), right and down only."""
    pass
`,
    [
      { name: "example", got: "unique_paths(3, 7)", want: "28" },
      { name: "square", got: "unique_paths(3, 2)", want: "3" },
    ],
  ),
  "jump-game": spec(
    `from typing import List

def can_jump(nums: List[int]) -> bool:
    """True if the last index is reachable."""
    pass
`,
    [
      { name: "yes", got: "can_jump([2,3,1,1,4])", want: "True" },
      { name: "no", got: "can_jump([3,2,1,0,4])", want: "False" },
    ],
  ),
  "insert-interval": spec(
    `from typing import List

def insert(intervals: List[List[int]], new_interval: List[int]) -> List[List[int]]:
    """Insert and merge into a sorted disjoint interval list."""
    pass
`,
    [
      { name: "example", got: "insert([[1,3],[6,9]], [2,5])", want: "[[1, 5], [6, 9]]" },
      { name: "empty", got: "insert([], [5,7])", want: "[[5, 7]]" },
    ],
  ),
  "kth-largest": spec(
    `from typing import List

def find_kth_largest(nums: List[int], k: int) -> int:
    """Kth largest element (k=1 is the maximum)."""
    pass
`,
    [
      { name: "example", got: "find_kth_largest([3,2,1,5,6,4], 2)", want: "5" },
      { name: "dups", got: "find_kth_largest([3,2,3,1,2,4,5,5,6], 4)", want: "4" },
    ],
  ),
  "trapping-rain": spec(
    `from typing import List

def trap(height: List[int]) -> int:
    """Units of water trapped."""
    pass
`,
    [
      { name: "example", got: "trap([0,1,0,2,1,0,1,3,2,1,2,1])", want: "6" },
      { name: "flat", got: "trap([4,2,0,3,2,5])", want: "9" },
    ],
  ),
  "permute-lab": spec(
    `from typing import List

def permute(nums: List[int]) -> List[List[int]]:
    """Every permutation. Order of the list does not matter."""
    pass
`,
    [
      {
        name: "example",
        got: "sorted(tuple(p) for p in permute([1,2,3]))",
        want: "[(1, 2, 3), (1, 3, 2), (2, 1, 3), (2, 3, 1), (3, 1, 2), (3, 2, 1)]",
      },
    ],
  ),
  "valid-palindrome": spec(
    `def is_palindrome(s: str) -> bool:
    """True if s is a palindrome ignoring non-alphanumerics and case."""
    pass
`,
    [
      { name: "panama", got: 'is_palindrome("A man, a plan, a canal: Panama")', want: "True" },
      { name: "race", got: 'is_palindrome("race a car")', want: "False" },
      { name: "empty-ish", got: 'is_palindrome(" ")', want: "True" },
    ],
  ),
  "decode-ways-lab": spec(
    `def num_decodings(s: str) -> int:
    """Ways to decode digit string as A-Z (1..26)."""
    pass
`,
    [
      { name: "12", got: 'num_decodings("12")', want: "2" },
      { name: "226", got: 'num_decodings("226")', want: "3" },
      { name: "leading zero", got: 'num_decodings("06")', want: "0" },
    ],
  ),
  "length-of-lis": spec(
    `from typing import List

def length_of_lis(nums: List[int]) -> int:
    """Length of longest strictly increasing subsequence."""
    pass
`,
    [
      { name: "example", got: "length_of_lis([10,9,2,5,3,7,101,18])", want: "4" },
      { name: "single", got: "length_of_lis([7])", want: "1" },
    ],
  ),
  "max-product-sub": spec(
    `from typing import List

def max_product(nums: List[int]) -> int:
    """Maximum product of any contiguous subarray."""
    pass
`,
    [
      { name: "example", got: "max_product([2,3,-2,4])", want: "6" },
      { name: "zero", got: "max_product([-2,0,-1])", want: "0" },
    ],
  ),
  "combination-sum-lab": spec(
    `from typing import List

def combination_sum(candidates: List[int], target: int) -> List[List[int]]:
    """Combinations that sum to target; reuse allowed. Any inner order."""
    pass
`,
    [
      {
        name: "example",
        got: "sorted(tuple(sorted(c)) for c in combination_sum([2,3,6,7], 7))",
        want: "[(2, 2, 3), (7,)]",
      },
    ],
  ),
  "right-side-view": spec(
    `${TREE_HELPERS}

def right_side_view(root: Optional[TreeNode]) -> List[int]:
    """Right-side view, top to bottom."""
    pass
`,
    [
      { name: "example", got: "right_side_view(_tree([1,2,3,None,5,None,4]))", want: "[1, 3, 4]" },
      { name: "empty", got: "right_side_view(None)", want: "[]" },
    ],
    TREE_HELPERS,
  ),
  "set-matrix-zeroes": spec(
    `from typing import List

def set_zeroes(matrix: List[List[int]]) -> None:
    """Zero rows and columns that contain a 0. In place."""
    pass
`,
    [{ name: "example", got: "_run()", want: "[[1, 0, 1], [0, 0, 0], [1, 0, 1]]" }],
    `def _run():
    m = [[1,1,1],[1,0,1],[1,1,1]]
    set_zeroes(m)
    return m
`,
  ),
  "word-break-bool": spec(
    `from typing import List

def word_break(s: str, word_dict: List[str]) -> bool:
    """True if s is a concat of dictionary words (reuse ok)."""
    pass
`,
    [
      { name: "leetcode", got: 'word_break("leetcode", ["leet", "code"])', want: "True" },
      { name: "catsandog", got: 'word_break("catsandog", ["cats", "dog", "sand", "and", "cat"])', want: "False" },
    ],
  ),
};
