# Python List as Array

## Purpose and Use Case

An array is a data structure used to store multiple values in order.

In Python, the most common built-in structure used like an array is the **list**.

Lists are very important in DSA because many problems begin with a collection of values. For example, you may need to process a list of scores, search through a list of names, or calculate something from a list of numbers.

You will use lists when you need to:

* Store multiple values.
* Access values by position.
* Loop through data.
* Search for an item.
* Modify a collection.
* Build more advanced data structures.

## Core Concept

A Python list stores values in order.

Each value has an index.

The first index is always `0`.

```python
numbers = [10, 20, 30, 40]

print(numbers[0])
print(numbers[1])
```

Output:

```text
10
20
```

In this example:

```text
numbers[0] = 10
numbers[1] = 20
numbers[2] = 30
numbers[3] = 40
```

This is called **zero-based indexing**.

## Technical Breakdown

A list can store multiple values:

```python
scores = [85, 90, 78, 92]
```

You can get the number of items using `len()`:

```python
scores = [85, 90, 78, 92]

print(len(scores))
```

Output:

```text
4
```

You can access the last item using `len(scores) - 1`:

```python
scores = [85, 90, 78, 92]

last_index = len(scores) - 1
print(scores[last_index])
```

Output:

```text
92
```

Python also supports negative indexing:

```python
scores = [85, 90, 78, 92]

print(scores[-1])
print(scores[-2])
```

Output:

```text
92
78
```

`-1` means the last item.
`-2` means the second item from the end.

## Try it Yourself

Change the values and try accessing different indexes.

```python-run
numbers = [10, 20, 30, 40]

print(numbers[0])
print(numbers[-1])
print(len(numbers))
```

## Common Index Error

Be careful with indexes.

This code causes an error:

```python
numbers = [10, 20, 30]

print(numbers[3])
```

The valid indexes are:

```text
0, 1, 2
```

There is no index `3`.

This error is called:

```text
IndexError
```

## Best Practices

When working with lists, remember:

```text
First item: index 0
Last item: index len(list) - 1
Negative last item: index -1
```

Use `len()` when you need to know the size of a list.

Use small examples first when learning list behavior.

## Concept Summary

A Python list can be used like an array.

It stores values in order and allows access by index.

Key ideas:

```text
List = ordered collection
Index starts from 0
len(list) gives the number of items
list[-1] gets the last item
```

Lists are the foundation for many array-based DSA problems.




