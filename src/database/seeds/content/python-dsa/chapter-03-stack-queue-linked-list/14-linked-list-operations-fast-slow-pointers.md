# Linked List Operations and Fast-Slow Pointers

## Purpose and Use Case

After understanding linked list nodes, the next step is learning common operations and patterns.

Linked list operations include:

- Traversing nodes.
- Inserting a node.
- Deleting a node.
- Searching for a value.
- Finding the middle node.

A very common linked list pattern is the **fast-slow pointer** pattern.

It is useful for:

- Finding the middle of a linked list.
- Detecting cycles.
- Solving pointer-based problems.
- Understanding linked list traversal more deeply.

## Core Concept

In linked lists, we move through nodes using references.

A pointer is simply a variable that refers to a node.

Example:

```python
current = head
```

The fast-slow pointer pattern uses two pointers:

```text
slow moves 1 step at a time
fast moves 2 steps at a time
```

When fast reaches the end, slow is usually near the middle.

## Technical Breakdown

First, create a linked list:

```text
10 -> 20 -> 30 -> 40 -> 50 -> None
```

Python setup:

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

head = Node(10)
head.next = Node(20)
head.next.next = Node(30)
head.next.next.next = Node(40)
head.next.next.next.next = Node(50)
```

## Traversal

Traversal means visiting each node.

```python
current = head

while current is not None:
    print(current.value)
    current = current.next
```

Output:

```text
10
20
30
40
50
```

## Search

Search checks whether a value exists.

```python
target = 30
current = head
found = False

while current is not None:
    if current.value == target:
        found = True
        break
    current = current.next

print(found)
```

Output:

```text
True
```

## Insert at the Beginning

To insert a new node at the beginning:

```python
new_node = Node(5)
new_node.next = head
head = new_node
```

Now the list becomes:

```text
5 -> 10 -> 20 -> 30 -> 40 -> 50 -> None
```

## Fast-Slow Pointer: Find Middle

We can find the middle node using two pointers.

```python
slow = head
fast = head

while fast is not None and fast.next is not None:
    slow = slow.next
    fast = fast.next.next

print(slow.value)
```

If the list is:

```text
10 -> 20 -> 30 -> 40 -> 50
```

Output:

```text
30
```

The slow pointer reaches the middle when fast reaches the end.

## Try it Yourself

Change the linked list values and find the middle.

```python-run
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

head = Node(10)
head.next = Node(20)
head.next.next = Node(30)
head.next.next.next = Node(40)
head.next.next.next.next = Node(50)

slow = head
fast = head

while fast is not None and fast.next is not None:
    slow = slow.next
    fast = fast.next.next

print(slow.value)
```

## Best Practices

When working with linked lists:

```text
Always check for None
Do not lose the head reference
Draw the links before changing next pointers
Move pointers carefully
```

For fast-slow pointers, remember:

```text
slow moves one step
fast moves two steps
when fast reaches the end, slow is near the middle
```

This pattern is simple but powerful.

## Concept Summary

Linked list operations depend on node references.

Key ideas:

```text
Traversal visits nodes one by one
Search checks each node
Insert changes next references
Fast-slow pointers use two speeds
```

The fast-slow pointer pattern is especially useful for finding the middle of a linked list and preparing for more advanced linked list problems.
