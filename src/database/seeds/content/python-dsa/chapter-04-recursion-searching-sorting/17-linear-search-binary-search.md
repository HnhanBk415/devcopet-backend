# Linear Search and Binary Search

## Purpose and Use Case

Searching means finding whether a value exists in a collection.

Searching is one of the most common operations in programming.

You search when you need to:

- Find a username.
- Check if an item exists.
- Locate a score.
- Find a product by ID.
- Look for a value in a sorted list.

This lesson compares two important search techniques:

```text
Linear search
Binary search
```

## Core Concept

### Linear Search

Linear search checks items one by one from the beginning.

```text
[4, 8, 2, 9, 5]
 check 4
 check 8
 check 2
 check 9
 found
```

It works on any list, sorted or unsorted.

### Binary Search

Binary search works only on a sorted list.

It checks the middle value and removes half of the search space each time.

```text
[1, 3, 5, 7, 9, 11, 13]
          middle
```

If the target is larger than the middle, search the right half.

If the target is smaller than the middle, search the left half.

## Technical Breakdown

## Linear Search Example

Problem:

```text
Find the index of target in a list.
If target is not found, return -1.
```

Code:

```python
def linear_search(numbers, target):
    for i in range(len(numbers)):
        if numbers[i] == target:
            return i

    return -1

numbers = [4, 8, 2, 9, 5]

print(linear_search(numbers, 9))
```

Output:

```text
3
```

Time complexity:

```text
O(n)
```

In the worst case, we may need to check every item.

## Binary Search Example

Binary search requires a sorted list.

```python
def binary_search(numbers, target):
    left = 0
    right = len(numbers) - 1

    while left <= right:
        mid = (left + right) // 2

        if numbers[mid] == target:
            return mid
        elif numbers[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1

numbers = [1, 3, 5, 7, 9, 11, 13]

print(binary_search(numbers, 9))
```

Output:

```text
4
```

Time complexity:

```text
O(log n)
```

Binary search is faster for large sorted lists because it cuts the search space in half each step.

## Try it Yourself

Change the target and observe the returned index.

```python-run
def binary_search(numbers, target):
    left = 0
    right = len(numbers) - 1

    while left <= right:
        mid = (left + right) // 2

        if numbers[mid] == target:
            return mid
        elif numbers[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1

numbers = [1, 3, 5, 7, 9, 11, 13]

print(binary_search(numbers, 9))
```

## Linear Search vs Binary Search

```text
Linear search:
- Works on unsorted lists
- Checks one by one
- O(n)

Binary search:
- Requires sorted list
- Cuts search space in half
- O(log n)
```

If the list is unsorted and you only search once, linear search may be enough.

If the list is sorted or you need to search many times, binary search is often better.

## Best Practices

Use linear search when:

```text
The list is small
The list is unsorted
You only need to search once
```

Use binary search when:

```text
The list is sorted
The data is large
You need faster lookup by order
```

Always remember: binary search only works correctly if the data is sorted.

## Concept Summary

Searching helps us find values in a collection.

Key ideas:

```text
Linear search checks each item
Binary search checks the middle and removes half
Linear search is O(n)
Binary search is O(log n)
Binary search requires sorted data
```
