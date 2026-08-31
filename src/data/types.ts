export type Difficulty = "easy" | "medium" | "hard";

export type PatternId =
  | "hashing"
  | "two-pointers"
  | "sliding-window"
  | "stack"
  | "binary-search"
  | "linked-list"
  | "trees"
  | "heaps"
  | "graphs"
  | "dp"
  | "intervals"
  | "backtracking";

export type Track = "core" | "data-science" | "mle" | "sql";

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  pattern: PatternId;
  patterns: PatternId[];
  track: Track[];
  leetcode: { number: number; slug: string };
  xp: number;
  estimatedMinutes: number;
  local: boolean;
  summary: string;
  prompt: string;
  examples: Example[];
  constraints: string[];
  hints: string[];
  interviewNote: string;
}

export interface PatternGuide {
  id: PatternId;
  name: string;
  tagline: string;
  whenToUse: string;
  template: string;
  pitfalls: string[];
  studyMinutes: number;
  xp: number;
}

export interface Resource {
  id: string;
  title: string;
  kind: "roadmap" | "video" | "article" | "book" | "course" | "practice" | "behavioral";
  url: string;
  cost: "free" | "paid" | "freemium";
  minutes?: number;
  blurb: string;
  tags: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  xp: number;
}

export interface Rank {
  level: number;
  title: string;
  copy: string;
}

export interface SolveRecord {
  solvedAt: string;
  attempts: number;
  hintsUsed: number;
  peekedSolution: boolean;
  xpEarned: number;
  localPass: boolean;
}

export interface Progress {
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  solved: Record<string, SolveRecord>;
  studied: Record<string, string>;
  resourcesRead: string[];
  achievements: string[];
  questLog: Record<string, string[]>;
  reviewCount: number;
}

export const XP_PER_LEVEL = 400;

export const DIFFICULTY_XP: Record<Difficulty, number> = {
  easy: 100,
  medium: 200,
  hard: 350,
};

export const RANKS: Rank[] = [
  { level: 1, title: "Applicant", copy: "Resume is out. Warm up with hashing and two pointers." },
  { level: 3, title: "OA Ready", copy: "Online assessments stop looking like a foreign language." },
  { level: 6, title: "Phone Screen", copy: "You can talk through a medium while writing real code." },
  { level: 10, title: "Onsite", copy: "Patterns are muscle memory. Interviews become conversations." },
  { level: 15, title: "Offer Loop", copy: "You debug out loud, quote complexity, and ask clarifying questions first." },
  { level: 22, title: "Staff Candidate", copy: "You reach for the right pattern before the first loop." },
  { level: 30, title: "Hired", copy: "The grind worked. Keep a light review cadence so it sticks." },
];

export const PATTERNS: PatternGuide[] = [
  {
    id: "hashing",
    name: "Hash maps & sets",
    tagline: "Trade memory for an O(1) lookup when the naive scan is O(n²).",
    whenToUse:
      "You need to know if a value was seen before, count frequencies, or pair complements (target − x).",
    template: `seen = {}
for i, x in enumerate(nums):
    need = target - x
    if need in seen:
        return [seen[need], i]
    seen[x] = i`,
    pitfalls: [
      "Using the same index twice — insert into the map after the lookup.",
      "Forgetting that dict keys must be hashable (tuples, not lists).",
    ],
    studyMinutes: 20,
    xp: 40,
  },
  {
    id: "two-pointers",
    name: "Two pointers",
    tagline: "Sorted array or a string scanned from both ends (or a slow/fast pair).",
    whenToUse:
      "The input is sorted, you need a pair/triple summing to a target, or you are shrinking a palindrome/container.",
    template: `lo, hi = 0, len(arr) - 1
while lo < hi:
    s = arr[lo] + arr[hi]
    if s == target:
        return [lo, hi]
    if s < target:
        lo += 1
    else:
        hi -= 1`,
    pitfalls: [
      "Forgetting to skip duplicates in 3-sum variants.",
      "Off-by-one when the pointers should meet vs cross.",
    ],
    studyMinutes: 20,
    xp: 40,
  },
  {
    id: "sliding-window",
    name: "Sliding window",
    tagline: "A subarray/substring that grows and shrinks as you scan once.",
    whenToUse:
      "Longest/shortest subarray with a constraint (unique chars, sum ≤ k, at most k distinct).",
    template: `left = 0
window = {}
best = 0
for right, ch in enumerate(s):
    window[ch] = window.get(ch, 0) + 1
    while invalid(window):
        window[s[left]] -= 1
        left += 1
    best = max(best, right - left + 1)`,
    pitfalls: [
      "Updating the answer in the wrong place (before vs after shrinking).",
      "Forgetting to decrement keys when the left pointer moves.",
    ],
    studyMinutes: 25,
    xp: 50,
  },
  {
    id: "stack",
    name: "Stack",
    tagline: "The last unmatched thing is the next one you need to resolve.",
    whenToUse:
      "Brackets, monotonic next-greater, parsing, or undo. Also: next warmer day, asteroid collisions.",
    template: `stack = []
for ch in s:
    if ch in pairs:
        stack.append(ch)
    else:
        if not stack or pairs[stack[-1]] != ch:
            return False
        stack.pop()
return not stack`,
    pitfalls: [
      "Not handling leftover items on the stack at the end.",
      "Using a list as a queue by accident (pop(0) is O(n)).",
    ],
    studyMinutes: 15,
    xp: 35,
  },
  {
    id: "binary-search",
    name: "Binary search",
    tagline: "Halve a monotonic search space — not just a sorted array.",
    whenToUse:
      "Sorted data, or a yes/no predicate that flips once (min capacity, first bad version, rotated array).",
    template: `lo, hi = 0, len(arr) - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if arr[mid] == target:
        return mid
    if arr[mid] < target:
        lo = mid + 1
    else:
        hi = mid - 1
return -1`,
    pitfalls: [
      "Infinite loops from not moving lo/hi strictly.",
      "Searching the value instead of the predicate (answer-space binary search).",
    ],
    studyMinutes: 25,
    xp: 50,
  },
  {
    id: "linked-list",
    name: "Linked lists",
    tagline: "Pointer gymnastics: dummy heads, reversal, and Floyd's cycle.",
    whenToUse:
      "Reorder, reverse, detect a cycle, merge two sorted lists, find the middle (slow/fast).",
    template: `dummy = ListNode(0, head)
prev, cur = dummy, head
while cur and cur.next:
    # mutate pointers
    ...
return dummy.next`,
    pitfalls: [
      "Losing the head pointer — keep a dummy node.",
      "Forgetting to cut the old .next when reversing.",
    ],
    studyMinutes: 20,
    xp: 40,
  },
  {
    id: "trees",
    name: "Trees",
    tagline: "Recursion is the language of trees. BFS if you need levels.",
    whenToUse:
      "Any binary tree / BST question: invert, depth, LCA, serialize, level order, validate BST.",
    template: `def dfs(node):
    if not node:
        return BASE
    left = dfs(node.left)
    right = dfs(node.right)
    return combine(node, left, right)`,
    pitfalls: [
      "Confusing BST vs binary tree constraints.",
      "Mutating while iterating a queue without copying the level.",
    ],
    studyMinutes: 25,
    xp: 50,
  },
  {
    id: "heaps",
    name: "Heaps",
    tagline: "You need the current top-k / running median, not a full sort.",
    whenToUse:
      "Kth largest, merge k lists, scheduling, streaming top elements. Python: heapq (min-heap).",
    template: `import heapq
heap = []
for x in nums:
    heapq.heappush(heap, x)
    if len(heap) > k:
        heapq.heappop(heap)`,
    pitfalls: [
      "Python heapq is a min-heap — negate values for a max-heap.",
      "Using a heap when a counting sort / bucket is O(n).",
    ],
    studyMinutes: 20,
    xp: 40,
  },
  {
    id: "graphs",
    name: "Graphs (BFS / DFS)",
    tagline: "If it is a grid, it is a graph. If there are prerequisites, it is a DAG.",
    whenToUse:
      "Islands, shortest path in unweighted graphs (BFS), cycle detection, topological sort, connected components.",
    template: `def dfs(r, c):
    if not inbound(r, c) or grid[r][c] != "1":
        return
    grid[r][c] = "0"
    for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
        dfs(r + dr, c + dc)`,
    pitfalls: [
      "Not marking visited and infinite-recursing.",
      "Using DFS for shortest path on unweighted graphs — that's BFS.",
    ],
    studyMinutes: 30,
    xp: 60,
  },
  {
    id: "dp",
    name: "Dynamic programming",
    tagline: "Name the state, the transition, and the base case. Then iterate.",
    whenToUse:
      "Optimal count/value over overlapping subproblems: climb stairs, rob houses, coin change, LIS, knapsack.",
    template: `dp = [0] * (n + 1)
dp[0] = 1
for i in range(1, n + 1):
    dp[i] = dp[i - 1] + (dp[i - 2] if i >= 2 else 0)
return dp[n]`,
    pitfalls: [
      "Jumping to code before stating dp[i] in English.",
      "Off-by-one in the capacity / index of the table.",
    ],
    studyMinutes: 35,
    xp: 70,
  },
  {
    id: "intervals",
    name: "Intervals",
    tagline: "Sort by start (sometimes end), then merge or sweep.",
    whenToUse:
      "Merge overlapping ranges, meeting rooms, insert interval, min arrows to burst balloons.",
    template: `intervals.sort()
merged = [intervals[0]]
for start, end in intervals[1:]:
    if start <= merged[-1][1]:
        merged[-1][1] = max(merged[-1][1], end)
    else:
        merged.append([start, end])`,
    pitfalls: [
      "Forgetting to sort first.",
      "Using < instead of <= for touching intervals that should merge.",
    ],
    studyMinutes: 15,
    xp: 35,
  },
  {
    id: "backtracking",
    name: "Backtracking",
    tagline: "Build a candidate, recurse, undo. Prune early.",
    whenToUse:
      "Subsets, permutations, combinations, Sudoku, palindrome partitions — explore a decision tree.",
    template: `def bt(path, start):
    ans.append(path[:])
    for i in range(start, n):
        path.append(nums[i])
        bt(path, i + 1)
        path.pop()`,
    pitfalls: [
      "Forgetting to copy path when recording an answer.",
      "Not undoing the choice (the pop).",
    ],
    studyMinutes: 25,
    xp: 50,
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-blood", name: "First Blood", description: "Solve your first problem.", xp: 25 },
  { id: "streak-3", name: "Daily Standup", description: "Hold a 3-day streak.", xp: 40 },
  { id: "streak-7", name: "Sprint Closer", description: "Hold a 7-day streak.", xp: 80 },
  { id: "streak-30", name: "Offer Season", description: "Hold a 30-day streak.", xp: 200 },
  { id: "easy-5", name: "Warmup Circuit", description: "Solve 5 easy problems.", xp: 40 },
  { id: "medium-5", name: "Phone Screen", description: "Solve 5 medium problems.", xp: 70 },
  { id: "hard-1", name: "Onsite Puzzle", description: "Solve a hard problem.", xp: 80 },
  { id: "hashing-3", name: "Hash Black Belt", description: "Solve 3 hashing problems.", xp: 50 },
  { id: "window-3", name: "Window Shopper", description: "Solve 3 sliding-window problems.", xp: 50 },
  { id: "graph-2", name: "Island Hopper", description: "Solve 2 graph problems.", xp: 50 },
  { id: "dp-2", name: "State Machine", description: "Solve 2 DP problems.", xp: 60 },
  { id: "no-hints", name: "Clean Take", description: "Solve a medium with zero hints.", xp: 40 },
  { id: "local-runner", name: "pytest Disciple", description: "Pass a local dojo test suite.", xp: 30 },
  { id: "scholar", name: "Pattern Scholar", description: "Study 4 pattern guides.", xp: 50 },
  { id: "librarian", name: "Resourceful", description: "Open 5 study resources.", xp: 30 },
  { id: "reviewer", name: "Spaced Reps", description: "Complete 3 review quests.", xp: 45 },
  { id: "catalog-12", name: "Blind Dozen", description: "Solve 12 catalog problems.", xp: 100 },
];
