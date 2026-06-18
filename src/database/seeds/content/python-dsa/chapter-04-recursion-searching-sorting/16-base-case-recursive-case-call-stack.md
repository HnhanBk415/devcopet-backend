# Base Case, Recursive Case, and Call Stack

## Purpose and Use Case

Recursion becomes much easier when you understand its two main parts:

```text
Base case
Recursive case
```

It also helps to understand the **call stack**, which is how Python keeps track of active function calls.

This lesson explains how recursive functions start, pause, call themselves, and return results.

You will need this idea for:

- Recursion problems.
- Tree traversal.
- Depth-first search.
- Merge sort.
- Quick sort.
- Backtracking.

## Core Concept

A recursive function must have:

```text
Base case       = the condition that stops recursion
Recursive case  = the part that calls the function again
```

Example:

```python
def factorial(n):
    if n == 1:
        return 1

    return n * factorial(n - 1)
```

In this function:

```text
Base case: n == 1
Recursive case: n * factorial(n - 1)
```

## Technical Breakdown

Factorial means:

```text
5! = 5 × 4 × 3 × 2 × 1
```

Recursive idea:

```text
factorial(5) = 5 × factorial(4)
factorial(4) = 4 × factorial(3)
factorial(3) = 3 × factorial(2)
factorial(2) = 2 × factorial(1)
factorial(1) = 1
```

Python code:

```python
def factorial(n):
    if n == 1:
        return 1

    return n * factorial(n - 1)

print(factorial(5))
```

Output:

```text
120
```

## What is the Call Stack?

The call stack stores active function calls.

When a function calls another function, Python pauses the current function and puts the new function call on top of the stack.

For `factorial(4)`, the call stack grows like this:

```text
factorial(4)
factorial(3)
factorial(2)
factorial(1)
```

When the base case returns, the stack starts resolving:

```text
factorial(1) returns 1
factorial(2) returns 2 * 1 = 2
factorial(3) returns 3 * 2 = 6
factorial(4) returns 4 * 6 = 24
```

## Try it Yourself

Change the value of `n` and observe the result.

```python-run
def factorial(n):
    if n == 1:
        return 1

    return n * factorial(n - 1)

print(factorial(4))
```

## Common Mistake: Missing Base Case

This code is dangerous:

```python
def bad_recursion(n):
    print(n)
    bad_recursion(n - 1)

bad_recursion(3)
```

There is no base case, so the function keeps calling itself.

Python eventually raises:

```text
RecursionError
```

## Common Mistake: Not Moving Toward Base Case

This function has a base case, but it never gets closer to it:

```python
def bad_countdown(n):
    if n == 0:
        return

    print(n)
    bad_countdown(n)
```

The input stays the same, so the function never reaches `n == 0`.

A correct version should change the input:

```python
def countdown(n):
    if n == 0:
        return

    print(n)
    countdown(n - 1)
```

## Best Practices

When writing recursion, always check:

```text
Does the function have a base case?
Does each recursive call move closer to the base case?
Is the input getting smaller or simpler?
```

For beginners, write the base case first.

Then write the recursive case.

## Concept Summary

Recursive functions depend on two parts:

```text
Base case = stop
Recursive case = continue with a smaller problem
```

The call stack keeps track of active function calls.

Understanding the call stack helps you predict how recursive functions return values.
