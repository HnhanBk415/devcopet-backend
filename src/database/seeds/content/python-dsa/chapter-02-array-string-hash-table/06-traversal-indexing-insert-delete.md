# Traversal, Indexing, Insert and Delete

## Purpose and Use Case

After learning what a list is, the next step is learning how to work with it.

Common list operations include:

* Traversal
* Indexing
* Inserting
* Updating
* Deleting

These operations appear in many DSA problems.

For example, you may need to scan all numbers, update a value, remove an item, or add a new item.

Understanding these operations also helps you analyze time complexity.

## Core Concept

A list is useful because you can access and modify its items.

Common operations:

```text
Traversal = visit each item
Indexing = access item by position
Insert = add a new item
Delete = remove an item
Update = change an item
```

Each operation has a different cost.

Some operations are fast.
Some operations may require shifting many items.

## Technical Breakdown

### Traversal

Traversal means going through each item in a list.

```python
numbers = [3, 5, 7]

for number in numbers:
    print(number)
```

Output:

```text
3
5
7
```

This is `O(n)` because the loop visits every item.

### Indexing

Indexing means accessing an item by position.

```python
numbers = [3, 5, 7]

print(numbers[1])
```

Output:

```text
5
```

Accessing an item by index is usually `O(1)`.

### Update

You can change a value by index:

```python
numbers = [3, 5, 7]

numbers[1] = 10

print(numbers)
```

Output:

```text
[3, 10, 7]
```

Updating by index is usually `O(1)`.

### Insert at the End

You can add an item to the end using `append()`:

```python
numbers = [3, 5, 7]

numbers.append(9)

print(numbers)
```

Output:

```text
[3, 5, 7, 9]
```

Appending to the end is usually efficient.

### Insert in the Middle

You can insert at a specific position:

```python
numbers = [3, 5, 7]

numbers.insert(1, 100)

print(numbers)
```

Output:

```text
[3, 100, 5, 7]
```

Inserting in the middle may require shifting items to the right.

So it can be `O(n)`.

### Delete by Value

You can remove an item by value:

```python
numbers = [3, 5, 7]

numbers.remove(5)

print(numbers)
```

Output:

```text
[3, 7]
```

### Delete by Index

You can remove an item by index using `pop()`:

```python
numbers = [3, 5, 7]

numbers.pop(1)

print(numbers)
```

Output:

```text
[3, 7]
```

Deleting from the middle may require shifting items, so it can be `O(n)`.

## Try it Yourself

Try changing the index and inserted value.

```python-run
numbers = [3, 5, 7]

numbers.append(9)
numbers[1] = 10
numbers.pop(0)

print(numbers)
```

## Operation Complexity Summary

Common list operation costs:

```text
Access by index: O(1)
Update by index: O(1)
Traversal: O(n)
Append at end: usually O(1)
Insert in middle: O(n)
Delete in middle: O(n)
```

These costs matter when the list becomes large.

## Best Practices

Use `append()` when you want to add an item to the end.

Be careful when inserting or deleting in the middle of a list because items may need to shift.

When solving DSA problems, always ask:

```text
Do I need to visit every item?
Do I need fast access by index?
Am I inserting or deleting many items?
```

## Concept Summary

Lists support many important operations.

Key ideas:

```text
Traversal checks every item
Indexing gets an item by position
Append adds to the end
Insert adds at a specific position
Delete removes an item
```

Understanding these operations helps you analyze array-based problems.


