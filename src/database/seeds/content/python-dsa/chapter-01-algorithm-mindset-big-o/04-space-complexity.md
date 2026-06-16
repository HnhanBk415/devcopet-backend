# `04-space-complexity.md`

# Space Complexity

## Purpose and Use Case

Space complexity describes how much extra memory an algorithm uses.

An algorithm may be fast, but if it uses too much memory, it can still be inefficient.

For example, if you process a very large list and create many additional lists, your program may use too much memory.

Space complexity helps you understand the memory cost of your solution.

You will use space complexity when you need to:

* Work with large data.
* Avoid unnecessary memory usage.
* Compare two solutions.
* Understand the trade-off between speed and memory.

## Core Concept

Space complexity measures the extra memory used by an algorithm.

The original input is usually not counted as extra space.

We focus on additional things created by the algorithm, such as:

```text
Variables
Lists
Dictionaries
Sets
Queues
Stacks
```

Common space complexities:

```text
O(1)  Constant space
O(n)  Linear space
```

## Technical Breakdown

### O(1): Constant Space

An algorithm uses `O(1)` space when it only uses a fixed number of extra variables.

Example:

```python
numbers = [1, 2, 3, 4, 5]

total = 0

for number in numbers:
    total += number

print(total)
```

Output:

```text
15
```

This algorithm uses one extra variable:

```python
total
```

Even if the list becomes larger, we still only use a fixed number of extra variables.

So the extra space is:

```text
O(1)
```

### O(n): Linear Space

An algorithm uses `O(n)` space when it creates a new structure that grows with the input size.

Example:

```python
numbers = [1, 2, 3, 4, 5]

doubled = []

for number in numbers:
    doubled.append(number * 2)

print(doubled)
```

Output:

```text
[2, 4, 6, 8, 10]
```

The new list `doubled` has the same number of items as `numbers`.

If `numbers` has 5 items, `doubled` has 5 items.
If `numbers` has 1,000 items, `doubled` has 1,000 items.

So the extra space is:

```text
O(n)
```

## Try it Yourself

Change the list and observe how the new list grows.

```python-run
numbers = [1, 2, 3, 4, 5]

doubled = []

for number in numbers:
    doubled.append(number * 2)

print(doubled)
```

## Time and Space Trade-Off

Sometimes we use more memory to make a solution faster.

For example, using a set can help us check if a value exists quickly.

```python
numbers = [1, 2, 3, 4, 5]
seen = set(numbers)

print(3 in seen)
```

Output:

```text
True
```

The set uses extra memory, but it can make lookup faster.

This is called a trade-off.

A trade-off means we improve one thing by spending another thing.

In DSA, a common trade-off is:

```text
Use more memory to save time.
```

## Best Practices

When thinking about space complexity, ask:

```text
Am I creating a new list?
Am I creating a dictionary or set?
Can I solve the problem with only a few variables?
Is the extra memory worth the speed improvement?
```

Do not always avoid extra memory.

Sometimes using extra memory is the right choice if it makes the algorithm much faster and easier to understand.

## Concept Summary

Space complexity describes how much extra memory an algorithm uses.

Common examples:

```text
O(1) = constant extra space
O(n) = extra space grows with input size
```

A good solution should consider both time and space.

Sometimes the best solution is not the one that uses the least memory, but the one that balances speed, memory, and clarity.


