# Linked List Concept

## Purpose and Use Case

A linked list is a data structure made of nodes.

Each node stores data and a reference to the next node.

Unlike a Python list, a linked list does not store all items in one continuous indexed structure.

Linked lists are important because they teach how data can be connected using references.

They are used to understand:

- Node-based data structures.
- Dynamic memory-like behavior.
- Insert and delete operations.
- Pointers and references.
- More advanced structures such as trees and graphs.

## Core Concept

A linked list is made of nodes.

Each node has:

```text
value
next reference
```

Example:

```text
[10] -> [20] -> [30] -> None
```

The first node is called the **head**.

```text
head
 ↓
[10] -> [20] -> [30] -> None
```

The last node points to `None`.

## Technical Breakdown

In Python, we can define a node using a class.

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None
```

Now we can create nodes:

```python
first = Node(10)
second = Node(20)
third = Node(30)

first.next = second
second.next = third
```

This creates:

```text
10 -> 20 -> 30 -> None
```

To traverse a linked list, we start from the head and follow `next`.

```python
current = first

while current is not None:
    print(current.value)
    current = current.next
```

Output:

```text
10
20
30
```

## Try it Yourself

Change the node values and run the traversal.

```python-run
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

first = Node(10)
second = Node(20)
third = Node(30)

first.next = second
second.next = third

current = first

while current is not None:
    print(current.value)
    current = current.next
```

## Linked List vs Python List

A Python list allows direct access by index:

```python
numbers = [10, 20, 30]
print(numbers[1])
```

Output:

```text
20
```

A linked list does not have direct index access.

To get to the second node, we must start at the head and move one node at a time.

This means linked list traversal is usually `O(n)`.

## Best Practices

When working with linked lists, always track references carefully.

Common mistakes:

```text
Forgetting to update next
Losing the head node
Creating an accidental cycle
Stopping traversal too late
```

Use diagrams when learning linked lists. They make the references easier to understand.

## Concept Summary

A linked list is a sequence of connected nodes.

Key ideas:

```text
Each node stores a value
Each node points to the next node
The first node is the head
The last node points to None
Traversal follows next references
```

Linked lists are a foundation for understanding pointer-based data structures.
