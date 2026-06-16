# Monotonic Stack Introduction

## Purpose and Use Case

A monotonic stack is a special stack that keeps values in a specific order.

It is commonly used to solve problems where we need to find the next greater or next smaller value.

For example:

```text
For each number, find the next greater number on its right.
```

Monotonic stacks appear in problems such as:

- Next greater element.
- Daily temperatures.
- Stock span.
- Histogram problems.
- Finding previous smaller or greater values.

This lesson introduces the basic idea only. You do not need to master every advanced use case yet.

## Core Concept

A monotonic stack keeps items in increasing or decreasing order.

There are two common types:

```text
Monotonic increasing stack
Monotonic decreasing stack
```

The stack may remove items that break the desired order.

For a next greater element problem, we often use a stack to remember values that are still waiting for a greater value.

## Technical Breakdown

Problem:

```text
Given a list of numbers, find the next greater number for each item.
If there is no greater number on the right, use -1.
```

Example:

```text
numbers = [2, 1, 3]
```

Result:

```text
2 -> 3
1 -> 3
3 -> -1
```

### Simple Idea

For each number, look to the right and find the first greater number.

This brute force approach uses nested loops and can be `O(n²)`.

### Monotonic Stack Idea

We can use a stack to store indexes of numbers that are still waiting for a greater number.

When we find a number that is greater than the top of the stack, we update the answer.

```python
numbers = [2, 1, 3]

result = [-1] * len(numbers)
stack = []

for i in range(len(numbers)):
    while stack and numbers[i] > numbers[stack[-1]]:
        index = stack.pop()
        result[index] = numbers[i]

    stack.append(i)

print(result)
```

Output:

```text
[3, 3, -1]
```

## Step-by-Step Explanation

Start:

```text
numbers = [2, 1, 3]
result = [-1, -1, -1]
stack = []
```

When `i = 0`, number is `2`.

```text
No previous item is waiting.
Push index 0.
stack = [0]
```

When `i = 1`, number is `1`.

```text
1 is not greater than 2.
Push index 1.
stack = [0, 1]
```

When `i = 2`, number is `3`.

```text
3 is greater than numbers[1], so result[1] = 3.
3 is also greater than numbers[0], so result[0] = 3.
Push index 2.
```

Final result:

```text
[3, 3, -1]
```

## Try it Yourself

Change the list and observe the next greater values.

```python-run
numbers = [2, 1, 3]

result = [-1] * len(numbers)
stack = []

for i in range(len(numbers)):
    while stack and numbers[i] > numbers[stack[-1]]:
        index = stack.pop()
        result[index] = numbers[i]

    stack.append(i)

print(result)
```

## Best Practices

Use a monotonic stack when:

```text
You need the next greater value
You need the next smaller value
You need to compare each item with nearby future items
A brute force nested-loop solution feels too slow
```

At first, monotonic stack may feel confusing. Focus on the main idea:

```text
The stack stores items that are still waiting for an answer.
```

## Concept Summary

A monotonic stack is a stack that maintains an ordered pattern.

It helps solve next greater or next smaller problems efficiently.

Key ideas:

```text
Use stack to remember waiting items
Pop when the current item answers previous items
Often improves O(n²) brute force to O(n)
```
