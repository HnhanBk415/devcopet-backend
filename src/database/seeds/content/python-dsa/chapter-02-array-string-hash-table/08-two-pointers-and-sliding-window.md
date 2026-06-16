# Two Pointers and Sliding Window

## Purpose and Use Case

Two pointers and sliding window are common problem-solving patterns for arrays and strings.

They help reduce unnecessary work.

Instead of checking many possibilities with nested loops, these patterns use indexes to move through data more efficiently.

You will use these patterns for problems such as:

* Checking pairs in a sorted list.
* Reversing a list or string.
* Finding a subarray.
* Finding the longest or shortest section of data.
* Processing continuous parts of an array or string.

## Core Concept

### Two Pointers

Two pointers means using two indexes to scan data.

Usually, one pointer starts at the left and the other starts at the right.

```text
left →              ← right
[1, 2, 3, 4, 5]
```

This pattern is useful when we need to compare two positions.

### Sliding Window

Sliding window means keeping a section of the array or string and moving that section forward.

Example window size = 3:

```text
[1, 2, 3, 4, 5]
 ^^^^^
```

Then the window moves:

```text
[1, 2, 3, 4, 5]
    ^^^^^
```

This pattern is useful when the problem asks about continuous parts of data.

## Technical Breakdown

## Two Pointers Example

Problem:

```text
Given a sorted list and a target,
check if two numbers add up to the target.
```

Example:

```text
numbers = [1, 2, 4, 6, 8]
target = 10
```

We can use two pointers:

```python
numbers = [1, 2, 4, 6, 8]
target = 10

left = 0
right = len(numbers) - 1

found = False

while left < right:
    current_sum = numbers[left] + numbers[right]

    if current_sum == target:
        found = True
        break
    elif current_sum < target:
        left += 1
    else:
        right -= 1

print(found)
```

Output:

```text
True
```

Why does this work?

```text
If the sum is too small, move left forward to get a larger number.
If the sum is too large, move right backward to get a smaller number.
```

This works because the list is sorted.

Time complexity:

```text
O(n)
```

## Try it Yourself

Change the target value and run the code.

```python-run
numbers = [1, 2, 4, 6, 8]
target = 10

left = 0
right = len(numbers) - 1

found = False

while left < right:
    current_sum = numbers[left] + numbers[right]

    if current_sum == target:
        found = True
        break
    elif current_sum < target:
        left += 1
    else:
        right -= 1

print(found)
```

## Sliding Window Example

Problem:

```text
Given a list of numbers, find the maximum sum of any 3 consecutive numbers.
```

Example:

```text
numbers = [2, 1, 5, 1, 3, 2]
```

Window size is `3`.

Possible windows:

```text
2 + 1 + 5 = 8
1 + 5 + 1 = 7
5 + 1 + 3 = 9
1 + 3 + 2 = 6
```

The answer is `9`.

Python code:

```python
numbers = [2, 1, 5, 1, 3, 2]
k = 3

window_sum = sum(numbers[0:k])
max_sum = window_sum

for i in range(k, len(numbers)):
    window_sum += numbers[i]
    window_sum -= numbers[i - k]
    max_sum = max(max_sum, window_sum)

print(max_sum)
```

Output:

```text
9
```

The window moves by:

```text
Add the new item
Remove the item that left the window
```

This avoids recalculating the whole sum every time.

Time complexity:

```text
O(n)
```

## Why These Patterns Matter

A brute force solution may check too many possibilities.

For example, checking every pair with nested loops can be `O(n²)`.

Two pointers can sometimes reduce that to `O(n)`.

Similarly, recalculating every window sum from scratch can be slow.

Sliding window avoids repeated work by updating the current window.

## Best Practices

Use two pointers when:

```text
The problem involves pairs
The input is sorted
You need to compare values from both ends
```

Use sliding window when:

```text
The problem involves continuous subarrays or substrings
You need to calculate something over a moving section
The section moves through the input
```

These patterns are powerful because they often turn `O(n²)` solutions into `O(n)` solutions.

## Concept Summary

Two pointers and sliding window are common DSA patterns.

Key ideas:

```text
Two pointers use two indexes
Sliding window moves a section through the input
Both patterns help reduce repeated work
```

They are especially useful for array and string problems.

