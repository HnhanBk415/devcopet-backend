# Recursion Basics

## Purpose and Use Case

Recursion is a programming technique where a function calls itself.

At first, recursion can feel strange because we usually expect a function to run from top to bottom and then stop. With recursion, the function repeats by calling itself with a smaller or simpler input.

Recursion is useful when a problem can be broken into smaller versions of the same problem.

You will see recursion in many DSA topics, such as:

- Tree traversal.
- Graph traversal.
- Divide-and-conquer algorithms.
- Backtracking.
- Searching through nested structures.
- Solving repeated subproblems.

## Core Concept

A recursive function solves a problem by doing two things:

```text
1. Solve a small piece of the current problem.
2. Call itself to solve the smaller remaining problem.
```

Example idea:

```text
countdown(3)
→ print 3
→ countdown(2)
→ print 2
→ countdown(1)
→ print 1
→ countdown(0)
→ stop
```

The function keeps calling itself until it reaches a stopping point.

That stopping point is called the **base case**.

## Technical Breakdown

Here is a simple recursive countdown:

```python
def countdown(n):
    if n == 0:
        print("Done")
        return

    print(n)
    countdown(n - 1)

countdown(3)
```

Output:

```text
3
2
1
Done
```

When `countdown(3)` runs:

```text
n is 3
3 is not 0
print 3
call countdown(2)
```

When `countdown(0)` runs:

```text
n is 0
print Done
return
```

The recursion stops at `n == 0`.

## Try it Yourself

Change the starting number and observe the output.

```python-run
def countdown(n):
    if n == 0:
        print("Done")
        return

    print(n)
    countdown(n - 1)

countdown(5)
```

## Recursive Thinking

To think recursively, ask:

```text
What is the smallest version of this problem?
How can I make the current problem smaller?
When should the function stop?
```

Example: sum numbers from `1` to `n`.

```text
sum_to(5) = 5 + sum_to(4)
sum_to(4) = 4 + sum_to(3)
sum_to(3) = 3 + sum_to(2)
sum_to(2) = 2 + sum_to(1)
sum_to(1) = 1
```

Python code:

```python
def sum_to(n):
    if n == 1:
        return 1

    return n + sum_to(n - 1)

print(sum_to(5))
```

Output:

```text
15
```

## Best Practices

Every recursive function must have a clear stopping condition.

Without a stopping condition, recursion may continue forever until Python raises an error.

A good recursive function usually has:

```text
Base case: when to stop
Recursive case: how to move closer to the base case
```

Start with simple examples like countdown, factorial, and sum before using recursion in trees or graphs.

## Concept Summary

Recursion means a function calls itself.

Key ideas:

```text
Recursive function = function that calls itself
Base case = stopping condition
Recursive case = calls itself with a smaller problem
```

Recursion is an important foundation for trees, graphs, divide-and-conquer algorithms, and advanced problem-solving.
