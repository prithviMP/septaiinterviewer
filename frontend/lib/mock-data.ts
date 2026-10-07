export type LevelId = "junior" | "mid" | "senior";
export type DepthId = "sprint" | "standard" | "deep";

export const topics = [
  { id: "DSA", name: "Data Structures & Algorithms", detail: "Trees, Graphs & DP", icon: "account_tree", group: "core" },
  { id: "LLD", name: "Low-Level Design", detail: "Design Patterns & OOP", icon: "schema", group: "core" },
  { id: "HLD", name: "High-Level Design", detail: "Scalability & Latency", icon: "cloud_done", group: "core" },
  { id: "Java", name: "Java", detail: "JVM & collections", icon: "coffee", group: "lang" },
  { id: "Spring Boot", name: "Spring Boot", detail: "Beans & data", icon: "settings", group: "lang" },
  { id: "Node.js", name: "Node.js", detail: "Event loop", icon: "javascript", group: "lang" },
  { id: "Express", name: "Express.js", detail: "Middleware", icon: "route", group: "lang" },
] as const;

export const levels: { id: LevelId; label: string; short: string; note: string; icon: string }[] = [
  { id: "junior", label: "Junior (0–2 yrs)", short: "Junior", note: "0-2 yrs caliber", icon: "school" },
  { id: "mid", label: "Mid-Level (3–5 yrs)", short: "Mid-Level", note: "3-5 yrs caliber", icon: "rocket_launch" },
  { id: "senior", label: "Senior / Staff (6+ yrs)", short: "Senior / Staff", note: "6+ yrs caliber", icon: "military_tech" },
];

export const depths: { id: DepthId; label: string; minutes: number; questions: number; detail: string; popular?: boolean }[] = [
  { id: "sprint", label: "Quick Sprint", minutes: 15, questions: 3, detail: "3 questions • Warmup rapid drill" },
  { id: "standard", label: "Standard Mock", minutes: 30, questions: 5, detail: "5 questions • Realistic full loop", popular: true },
  { id: "deep", label: "Deep Dive", minutes: 50, questions: 8, detail: "8 questions • Staff-grade stress-test" },
];

export const focusOptions = [
  { id: "Technical Accuracy", icon: "verified", tone: "primary" as const },
  { id: "Edge Case Handling", icon: "bug_report", tone: "secondary" as const },
  { id: "Big-O Complexity", icon: "speed", tone: "tertiary" as const },
  { id: "Architectural Trade-offs", icon: "balance", tone: "muted" as const },
];

export type Example = {
  title: string;
  tag: string;
  input: string;
  output: string;
  explanation: string;
};

export type RubricItem = {
  icon: string;
  tone: "primary" | "secondary" | "tertiary";
  title: string;
  detail: string;
};

export type Question = {
  id: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  eyebrow: string;
  title: string;
  prompt: string;
  constraints: string[];
  examples: Example[];
  rubric: RubricItem[];
  hint: string;
  tests: { input: string; output: string }[];
  files: Record<string, { name: string; code: string }>;
};

const pythonWindow = `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Two pointer sliding window with character index map
        char_index_map = {}
        max_len = 0
        left = 0

        for right, char in enumerate(s):
            if char in char_index_map and char_index_map[char] >= left:
                left = char_index_map[char] + 1
            char_index_map[char] = right
            max_len = max(max_len, right - left + 1)

        return max_len`;

export const questions: Question[] = [
  {
    id: "q1",
    topic: "DSA • Arrays & Two Pointers",
    difficulty: "Medium",
    eyebrow: "DSA Assessment Question",
    title: "Longest Substring Without Repeating Characters",
    prompt:
      "Given a string s, find the length of the longest substring without repeating characters in optimal O(N) time and O(min(N, M)) space.",
    constraints: [
      "0 ≤ s.length ≤ 5 × 10^4",
      "s consists of English letters, digits, symbols, and spaces.",
    ],
    examples: [
      {
        title: "Example 1",
        tag: "Standard Sliding Window",
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with length 3.',
      },
      {
        title: "Example 2 (Edge Case)",
        tag: "Repeating Uniform",
        input: 's = "bbbbb"',
        output: "1",
        explanation: 'The answer is "b", with length 1.',
      },
    ],
    rubric: [
      {
        icon: "speed",
        tone: "primary",
        title: "Optimal Time/Space (40%)",
        detail: "Must achieve a single-pass sliding window with a character index map.",
      },
      {
        icon: "rule",
        tone: "secondary",
        title: "Boundary Robustness (35%)",
        detail: "Handles an empty string, whitespace, and uniform repeats.",
      },
      {
        icon: "record_voice_over",
        tone: "tertiary",
        title: "Verbalized Intuition (25%)",
        detail: "Explains how the left pointer jumps when a repeat appears.",
      },
    ],
    hint: "Track the last seen index of each character. On a repeat, jump the left pointer to max(left, last_seen[char] + 1) instead of stepping one character at a time.",
    tests: [
      { input: 's = "abcabcbb"', output: "3 (Pass)" },
      { input: 's = "bbbbb"', output: "1 (Pass)" },
      { input: 's = "pwwkew"', output: "3 (Pass)" },
    ],
    files: {
      python: { name: "solution.py", code: pythonWindow },
      javascript: {
        name: "solution.js",
        code: `function lengthOfLongestSubstring(s) {
  const seen = new Map();
  let left = 0;
  let maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    if (seen.has(s[right]) && seen.get(s[right]) >= left) {
      left = seen.get(s[right]) + 1;
    }
    seen.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
      },
      java: {
        name: "Solution.java",
        code: `class Solution {
  public int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> seen = new HashMap<>();
    int left = 0, maxLen = 0;
    for (int right = 0; right < s.length(); right++) {
      char c = s.charAt(right);
      if (seen.containsKey(c) && seen.get(c) >= left) left = seen.get(c) + 1;
      seen.put(c, right);
      maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
  }
}`,
      },
    },
  },
  {
    id: "q2",
    topic: "HLD • Distributed Systems",
    difficulty: "Hard",
    eyebrow: "System Design Question",
    title: "Design a Global API Rate Limiter",
    prompt:
      "Design a token-bucket rate limiter that works across regions. Call out where state lives, how refills stay atomic, and what happens when a region is slow.",
    constraints: ["P99 check under 5ms at the edge", "Accuracy within ±3% of the configured limit"],
    examples: [
      {
        title: "Example 1",
        tag: "Burst",
        input: "limit = 100/s, burst = 20",
        output: "Allow the burst, then throttle",
        explanation: "Local tokens absorb a short spike before the global bucket refills.",
      },
    ],
    rubric: [
      { icon: "schema", tone: "primary", title: "Architecture (40%)", detail: "Names the data store and the request path." },
      { icon: "balance", tone: "secondary", title: "Trade-offs (35%)", detail: "Compares strict global accuracy with edge latency." },
      { icon: "record_voice_over", tone: "tertiary", title: "Clarity (25%)", detail: "Walks the failure case out loud." },
    ],
    hint: "A single Redis GET then SET races. An atomic script, or a local buffer that syncs in batches, keeps the hot path short.",
    tests: [
      { input: "100 rps steady", output: "Allow (Pass)" },
      { input: "burst 500", output: "Throttle (Pass)" },
      { input: "region lag 200ms", output: "Local buffer (Pass)" },
    ],
    files: {
      python: { name: "notes.py", code: "# Sketch the limiter.\n# Where do tokens live?\n# How does a refill stay atomic?\n" },
      javascript: { name: "notes.js", code: "// Sketch the limiter.\n" },
      java: { name: "Notes.java", code: "// Sketch the limiter.\n" },
    },
  },
  {
    id: "q3",
    topic: "Java • Spring Boot",
    difficulty: "Medium",
    eyebrow: "Framework Question",
    title: "Bean Lifecycles and Transactional Proxies",
    prompt:
      "Explain how Spring creates a singleton, how it breaks a circular dependency, and why a @Transactional method called from the same class skips the proxy.",
    constraints: ["Cover the three singleton caches", "Name one fix for self-invocation"],
    examples: [
      {
        title: "Example",
        tag: "Self-invocation",
        input: "orderService.place() calls this.charge()",
        output: "charge() runs without a transaction",
        explanation: "The call never leaves the target object, so the proxy is skipped.",
      },
    ],
    rubric: [
      { icon: "verified", tone: "primary", title: "Accuracy (40%)", detail: "Names early singleton exposure correctly." },
      { icon: "rule", tone: "secondary", title: "Remediation (35%)", detail: "Offers a real fix, not only the symptom." },
      { icon: "record_voice_over", tone: "tertiary", title: "Clarity (25%)", detail: "Uses a short example." },
    ],
    hint: "Spring exposes the bean early so the other side can receive a reference before init finishes. Self-calls need a refactor or an exposed proxy.",
    tests: [
      { input: "circular A <-> B", output: "Early ref (Pass)" },
      { input: "self @Transactional", output: "Bypass (Pass)" },
      { input: "AopContext", output: "Proxy (Pass)" },
    ],
    files: {
      java: { name: "OrderService.java", code: "@Service\nclass OrderService {\n  @Transactional\n  void charge() {}\n\n  void place() {\n    this.charge();\n  }\n}\n" },
      python: { name: "notes.py", code: "# Describe the proxy bypass.\n" },
      javascript: { name: "notes.js", code: "// Describe the proxy bypass.\n" },
    },
  },
  {
    id: "q4",
    topic: "LLD • OOP",
    difficulty: "Medium",
    eyebrow: "Design Question",
    title: "Design a Parking Lot",
    prompt:
      "Model a parking lot with multiple floors, spot sizes, and a ticket. Show how a car finds a spot without scanning every floor on each entry.",
    constraints: ["Support bike, car, and truck", "O(1) or O(log n) assignment"],
    examples: [
      {
        title: "Example",
        tag: "Assignment",
        input: "car enters, compact spots free",
        output: "Ticket for floor 2, spot 14",
        explanation: "A free-list per spot size avoids a full scan.",
      },
    ],
    rubric: [
      { icon: "schema", tone: "primary", title: "Model (40%)", detail: "Classes match the nouns in the problem." },
      { icon: "speed", tone: "secondary", title: "Lookup (35%)", detail: "Assignment does not scan every spot." },
      { icon: "rule", tone: "tertiary", title: "Edges (25%)", detail: "Lot full and a leaving car are covered." },
    ],
    hint: "Keep a queue of free spot ids per size. Entry pops, exit pushes.",
    tests: [
      { input: "car enters", output: "Ticket (Pass)" },
      { input: "lot full", output: "Reject (Pass)" },
      { input: "car leaves", output: "Spot freed (Pass)" },
    ],
    files: {
      java: { name: "ParkingLot.java", code: "class ParkingLot {\n  // free spots by size\n}\n" },
      python: { name: "parking_lot.py", code: "class ParkingLot:\n    pass\n" },
      javascript: { name: "parkingLot.js", code: "class ParkingLot {}\n" },
    },
  },
  {
    id: "q5",
    topic: "Node.js • Event Loop",
    difficulty: "Medium",
    eyebrow: "Runtime Question",
    title: "Explain the Node.js Event Loop",
    prompt:
      "Order timers, I/O callbacks, poll, check, and close. Say where a resolved Promise runs relative to setImmediate and setTimeout.",
    constraints: ["Name the phases", "Place process.nextTick correctly"],
    examples: [
      {
        title: "Example",
        tag: "Order",
        input: "nextTick, Promise, setTimeout 0, setImmediate",
        output: "nextTick, Promise, then timer or check",
        explanation: "nextTick and microtasks drain before the loop continues.",
      },
    ],
    rubric: [
      { icon: "verified", tone: "primary", title: "Phase order (40%)", detail: "Timers, poll, and check are in the right order." },
      { icon: "speed", tone: "secondary", title: "Microtasks (35%)", detail: "Promises are not treated as timers." },
      { icon: "record_voice_over", tone: "tertiary", title: "Clarity (25%)", detail: "One concrete snippet is enough." },
    ],
    hint: "process.nextTick runs before other microtasks. Promise jobs run after that, still before the next phase.",
    tests: [
      { input: "nextTick vs promise", output: "nextTick first (Pass)" },
      { input: "poll empty", output: "check can run (Pass)" },
      { input: "long sync loop", output: "Loop blocked (Pass)" },
    ],
    files: {
      javascript: { name: "loop.js", code: "setTimeout(() => console.log('timeout'), 0);\nsetImmediate(() => console.log('immediate'));\nPromise.resolve().then(() => console.log('promise'));\nprocess.nextTick(() => console.log('nextTick'));\n" },
      python: { name: "notes.py", code: "# Order the phases.\n" },
      java: { name: "Notes.java", code: "// Order the phases.\n" },
    },
  },
  {
    id: "q6",
    topic: "Express • Middleware",
    difficulty: "Easy",
    eyebrow: "Framework Question",
    title: "Order of Express Middleware",
    prompt:
      "A request should be logged, authenticated, then validated. Show the middleware order and what happens if auth fails before the route handler.",
    constraints: ["Error middleware has 4 arguments", "Auth failure never reaches the handler"],
    examples: [
      {
        title: "Example",
        tag: "401",
        input: "missing token",
        output: "401 from auth middleware",
        explanation: "next(err) skips remaining success middleware.",
      },
    ],
    rubric: [
      { icon: "verified", tone: "primary", title: "Order (40%)", detail: "Auth sits before the handler." },
      { icon: "rule", tone: "secondary", title: "Errors (35%)", detail: "Error middleware is last." },
      { icon: "record_voice_over", tone: "tertiary", title: "Clarity (25%)", detail: "Says when next() is called." },
    ],
    hint: "Register error-handling middleware after the routes. Call next(err) from auth so the handler is skipped.",
    tests: [
      { input: "valid token", output: "200 (Pass)" },
      { input: "missing token", output: "401 (Pass)" },
      { input: "bad json", output: "400 (Pass)" },
    ],
    files: {
      javascript: { name: "app.js", code: "app.use(logger);\napp.use(auth);\napp.post('/orders', validate, handler);\napp.use(errorHandler);\n" },
      python: { name: "notes.py", code: "# Middleware order.\n" },
      java: { name: "Notes.java", code: "// Middleware order.\n" },
    },
  },
  {
    id: "q7",
    topic: "DSA • Graphs",
    difficulty: "Medium",
    eyebrow: "DSA Assessment Question",
    title: "Number of Islands",
    prompt: "Given a grid of 1s and 0s, return how many islands there are. Land connected on four sides is one island.",
    constraints: ["1 ≤ rows, cols ≤ 300", "Cells are '1' or '0'"],
    examples: [
      {
        title: "Example 1",
        tag: "DFS",
        input: "grid with 3 islands",
        output: "3",
        explanation: "Each DFS flood-fill marks one island visited.",
      },
    ],
    rubric: [
      { icon: "speed", tone: "primary", title: "Complexity (40%)", detail: "O(rows × cols) time." },
      { icon: "rule", tone: "secondary", title: "Visited (35%)", detail: "Land is not counted twice." },
      { icon: "record_voice_over", tone: "tertiary", title: "Clarity (25%)", detail: "Says DFS or BFS and why." },
    ],
    hint: "Walk every cell. When you see unvisited land, increment the count and flood-fill the island so you do not count it again.",
    tests: [
      { input: "one island", output: "1 (Pass)" },
      { input: "empty grid", output: "0 (Pass)" },
      { input: "diagonal only", output: "separate (Pass)" },
    ],
    files: {
      python: { name: "islands.py", code: "def num_islands(grid):\n    # flood fill\n    return 0\n" },
      javascript: { name: "islands.js", code: "function numIslands(grid) {\n  return 0;\n}\n" },
      java: { name: "Islands.java", code: "class Islands {\n  int numIslands(char[][] grid) { return 0; }\n}\n" },
    },
  },
  {
    id: "q8",
    topic: "HLD • Caching",
    difficulty: "Hard",
    eyebrow: "System Design Question",
    title: "Design a Distributed Cache",
    prompt:
      "Design a cache in front of a primary database. Cover eviction, stampede, and what clients see when a region fails.",
    constraints: ["Hot keys must not melt the database", "Stale reads have a stated bound"],
    examples: [
      {
        title: "Example",
        tag: "Stampede",
        input: "key expires, 10k requests arrive",
        output: "One fetch, the rest wait or serve stale",
        explanation: "A lock or request coalescing stops a thundering herd.",
      },
    ],
    rubric: [
      { icon: "balance", tone: "primary", title: "Trade-offs (40%)", detail: "Write-through vs write-back is explicit." },
      { icon: "speed", tone: "secondary", title: "Hot keys (35%)", detail: "Stampede protection is named." },
      { icon: "record_voice_over", tone: "tertiary", title: "Failure (25%)", detail: "Says what happens if the cache is down." },
    ],
    hint: "Single-flight the refresh for a hot key. Serve a slightly stale value while one worker refills.",
    tests: [
      { input: "cache hit", output: "fast (Pass)" },
      { input: "expiry stampede", output: "one fetch (Pass)" },
      { input: "cache down", output: "db fallback (Pass)" },
    ],
    files: {
      python: { name: "cache.py", code: "# eviction, stampede, failure\n" },
      javascript: { name: "cache.js", code: "// eviction, stampede, failure\n" },
      java: { name: "Cache.java", code: "// eviction, stampede, failure\n" },
    },
  },
];

export const languages = [
  { id: "python", label: "Python 3" },
  { id: "javascript", label: "JavaScript (ES2024)" },
  { id: "java", label: "Java 21" },
] as const;

export function depthById(id: DepthId) {
  return depths.find((item) => item.id === id) ?? depths[1];
}

export function levelById(id: LevelId) {
  return levels.find((item) => item.id === id) ?? levels[1];
}
