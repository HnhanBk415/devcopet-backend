# Merge Sort and Quick Sort Concepts

## Purpose and Use Case

Merge sort and quick sort are more advanced sorting algorithms.

They are important because they introduce a powerful strategy called **divide and conquer**.

Divide and conquer means:

```text
Divide the problem into smaller parts
Solve the smaller parts
Combine the results
```

These algorithms are usually faster than basic `O(n²)` sorting algorithms for large data.

## Core Concept

Both merge sort and quick sort divide the list into smaller pieces.

### Merge Sort

Merge sort divides the list into halves, sorts each half, and then merges them.

```text
[5, 2, 8, 1]
split
[5, 2] [8, 1]
split
[5] [2] [8] [1]
merge
[2, 5] [1, 8]
merge
[1, 2, 5, 8]
```

### Quick Sort

Quick sort chooses a pivot and partitions values around it.

```text
Values smaller than pivot go left
Values greater than pivot go right
Then sort each side
```

## Technical Breakdown

## Merge Sort Concept

Merge sort has two main steps:

```text
1. Split the list into halves.
2. Merge sorted halves together.
```

Simple Python implementation:

```python
def merge_sort(numbers):
    if len(numbers) <= 1:
        return numbers

    mid = len(numbers) // 2

    left = merge_sort(numbers[:mid])
    right = merge_sort(numbers[mid:])

    return merge(left, right)

def merge(left, right):
    result = []
    i = 0
    j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])

    return result

numbers = [5, 2, 8, 1]
print(merge_sort(numbers))
```

Output:

```text
[1, 2, 5, 8]
```

Time complexity:

```text
O(n log n)
```

## Try it Yourself

Change the list and run merge sort.

```python-run
def merge_sort(numbers):
    if len(numbers) <= 1:
        return numbers

    mid = len(numbers) // 2

    left = merge_sort(numbers[:mid])
    right = merge_sort(numbers[mid:])

    return merge(left, right)

def merge(left, right):
    result = []
    i = 0
    j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])

    return result

numbers = [5, 2, 8, 1]
print(merge_sort(numbers))
```

## Quick Sort Concept

Quick sort chooses a pivot value.

Then it separates values into groups:

```text
less than pivot
equal to pivot
greater than pivot
```

Simple concept implementation:

```python
def quick_sort(numbers):
    if len(numbers) <= 1:
        return numbers

    pivot = numbers[0]

    left = []
    equal = []
    right = []

    for number in numbers:
        if number < pivot:
            left.append(number)
        elif number == pivot:
            equal.append(number)
        else:
            right.append(number)

    return quick_sort(left) + equal + quick_sort(right)

numbers = [5, 2, 8, 1]
print(quick_sort(numbers))
```

Output:

```text
[1, 2, 5, 8]
```

Average time complexity:

```text
O(n log n)
```

Worst-case time complexity can be:

```text
O(n²)
```

This can happen if the pivot choices are very poor.

## Merge Sort vs Quick Sort

```text
Merge sort:
- Splits into halves
- Merges sorted parts
- Usually O(n log n)
- Uses extra space for merging

Quick sort:
- Chooses a pivot
- Partitions around the pivot
- Average O(n log n)
- Worst case can be O(n²)
```

Both are based on divide and conquer.

## Best Practices

At this stage, focus on the concept more than memorizing code.

Important ideas to remember:

```text
Merge sort divides and merges
Quick sort chooses a pivot and partitions
Both use recursion
Both are usually faster than basic O(n²) sorting
```

In real Python projects, you should still usually use `sorted()` or `.sort()`.

But understanding merge sort and quick sort prepares you for advanced DSA topics.

## Concept Summary

Merge sort and quick sort are divide-and-conquer sorting algorithms.

Key ideas:

```text
Divide and conquer breaks a problem into smaller parts
Merge sort splits and merges
Quick sort partitions around a pivot
Both use recursion
Both are important for understanding efficient sorting
```
