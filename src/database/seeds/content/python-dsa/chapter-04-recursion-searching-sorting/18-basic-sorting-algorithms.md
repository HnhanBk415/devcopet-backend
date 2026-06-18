# Basic Sorting Algorithms

## Purpose and Use Case

Sorting means arranging data in a specific order.

Most commonly, we sort numbers from smallest to largest or text alphabetically.

Sorting is useful because it helps with:

- Searching faster.
- Organizing data.
- Finding minimum and maximum patterns.
- Preparing data for binary search.
- Ranking scores.
- Cleaning and presenting information.

This lesson introduces basic sorting ideas before moving to more advanced sorting algorithms.

## Core Concept

A sorting algorithm rearranges items into order.

Example:

```text
Before: [5, 2, 8, 1]
After:  [1, 2, 5, 8]
```

Basic sorting algorithms usually work by comparing and swapping items.

They are not always the fastest, but they are great for learning how sorting works.

## Technical Breakdown

## Bubble Sort

Bubble sort repeatedly compares neighboring items and swaps them if they are in the wrong order.

Example:

```text
[5, 2, 8, 1]
compare 5 and 2 → swap
[2, 5, 8, 1]
compare 5 and 8 → no swap
compare 8 and 1 → swap
[2, 5, 1, 8]
```

The largest value slowly moves to the end.

Python code:

```python
numbers = [5, 2, 8, 1]

n = len(numbers)

for i in range(n):
    for j in range(0, n - i - 1):
        if numbers[j] > numbers[j + 1]:
            numbers[j], numbers[j + 1] = numbers[j + 1], numbers[j]

print(numbers)
```

Output:

```text
[1, 2, 5, 8]
```

Time complexity:

```text
O(n²)
```

## Try it Yourself

Change the numbers and observe the sorted result.

```python-run
numbers = [5, 2, 8, 1]

n = len(numbers)

for i in range(n):
    for j in range(0, n - i - 1):
        if numbers[j] > numbers[j + 1]:
            numbers[j], numbers[j + 1] = numbers[j + 1], numbers[j]

print(numbers)
```

## Selection Sort Concept

Selection sort finds the smallest item and puts it in the correct position.

Example:

```text
Find the smallest item
Swap it with the first unsorted position
Repeat
```

Code:

```python
numbers = [5, 2, 8, 1]

for i in range(len(numbers)):
    min_index = i

    for j in range(i + 1, len(numbers)):
        if numbers[j] < numbers[min_index]:
            min_index = j

    numbers[i], numbers[min_index] = numbers[min_index], numbers[i]

print(numbers)
```

Output:

```text
[1, 2, 5, 8]
```

Selection sort is also `O(n²)`.

## Insertion Sort Concept

Insertion sort builds the sorted part one item at a time.

It is similar to sorting cards in your hand.

```text
Take one item
Move it left until it is in the correct position
Repeat
```

Code:

```python
numbers = [5, 2, 8, 1]

for i in range(1, len(numbers)):
    key = numbers[i]
    j = i - 1

    while j >= 0 and numbers[j] > key:
        numbers[j + 1] = numbers[j]
        j -= 1

    numbers[j + 1] = key

print(numbers)
```

Output:

```text
[1, 2, 5, 8]
```

Insertion sort is also `O(n²)` in the average and worst cases.

## Best Practices

Basic sorting algorithms are useful for learning, but Python already has efficient built-in sorting.

In real Python projects, use:

```python
numbers.sort()
```

or:

```python
sorted_numbers = sorted(numbers)
```

Use basic sorting algorithms to understand comparison, swapping, and time complexity.

Use Python built-ins for real applications.

## Concept Summary

Sorting arranges data in order.

Key ideas:

```text
Bubble sort swaps neighboring items
Selection sort selects the smallest item
Insertion sort inserts each item into the sorted part
Basic sorts are usually O(n²)
Python built-in sorting is preferred in real projects
```
