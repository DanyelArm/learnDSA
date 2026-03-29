# The Ancient Library of Efficiency — Big-O Notation

## The Sages' Prophecy: What Is Big-O?

Long ago, the great algorithmic sages inscribed the Laws of Complexity onto stone tablets. Big-O notation is their language — a way to describe how the runtime or memory usage of an algorithm **grows** as the input size grows.

Big-O describes the **upper bound** on growth: the worst-case scenario. It answers the question: *"If I double the size of my input, how much longer will my algorithm take?"*

We write Big-O as `O(f(n))`, where `n` is the size of the input and `f(n)` describes the growth rate.

> **Important:** We drop constants and non-dominant terms. `O(3n + 5)` becomes `O(n)`. `O(n² + n)` becomes `O(n²)`. We care about the shape of growth, not the exact coefficients.

---

## The Five Sacred Growth Rates

### O(1) — Constant Time

The algorithm takes the same amount of time regardless of input size. Like fetching a scroll from a known shelf location — no matter how large the library grows, you know exactly where to look.

**Examples:** Array index access, dictionary key lookup, push/pop on a stack.

### O(log n) — Logarithmic Time

The algorithm cuts the problem roughly in half with each step. Even if the library doubles in size, you only need one more step. This is the power of **binary search**.

**Examples:** Binary search on a sorted array, height of a balanced binary tree.

### O(n) — Linear Time

The algorithm must visit each element once. As the input grows, so does the work — proportionally. Traversing an unsorted list looking for a value is a linear quest.

**Examples:** Linear search, summing all elements in a list.

### O(n log n) — Linearithmic Time

Efficient sorting algorithms like Merge Sort and Heap Sort achieve this. It is slower than O(n) but far better than O(n²) for large inputs.

**Examples:** Merge Sort, Heap Sort, many divide-and-conquer algorithms.

### O(n²) — Quadratic Time

For every element, you compare it to every other element. Two nested loops over the same input signal O(n²). This is the dreaded double-nested-loop trap.

**Examples:** Bubble Sort, Selection Sort, finding all pairs in a list.

---

## Time Complexity vs. Space Complexity

Big-O describes **two** dimensions of cost:

- **Time complexity** — how many operations the algorithm performs.
- **Space complexity** — how much extra memory the algorithm uses.

A recursive function that calls itself `n` times and keeps each call on the stack uses **O(n) space**, even if each call does O(1) work.

---

## Analyzing a Loop: Your First Complexity Proof

The golden rule: **one loop over `n` elements = O(n)**. Two nested loops = O(n²).

```python
# O(n) — linear: visits each element once
def linear_sum(nums):
    total = 0
    for num in nums:       # runs n times
        total += num       # O(1) work per iteration
    return total

# O(n²) — quadratic: nested loops, compares every pair
def all_pairs(nums):
    pairs = []
    for i in range(len(nums)):        # outer loop: n times
        for j in range(len(nums)):    # inner loop: n times for each outer
            pairs.append((nums[i], nums[j]))
    return pairs
```

In `linear_sum`, the loop runs `n` times and does O(1) work each time — total: **O(n)**.

In `all_pairs`, the outer loop runs `n` times, and for each iteration the inner loop also runs `n` times — total: **O(n × n) = O(n²)**.

---

## Best, Worst, and Average Case

Big-O is not always the full story. Consider searching for a value in a list:

- **Best case:** The target is the first element — O(1).
- **Worst case:** The target is the last element or not present — O(n).
- **Average case:** The target is somewhere in the middle — O(n/2) = O(n).

When engineers say "linear search is O(n)", they mean the **worst case**. Unless specified otherwise, Big-O refers to worst-case time complexity.

---

## Summary: The Complexity Hierarchy

From fastest to slowest growth:

`O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)`

Aim for the left side of this hierarchy. An O(n²) solution may work for 1,000 elements but will crawl with 1,000,000. The difference between O(n log n) and O(n²) sorting is the difference between seconds and hours on large datasets.

You are now armed with the first and most fundamental tool in every algorithmist's arsenal. Onward, adventurer!
