# Queue and Deque

## Purpose and Use Case

A queue is a linear data structure that follows the **First In, First Out** rule.

This means the first item added to the queue is the first item removed.

You can imagine a line of people waiting:

```text
Front                         Back
[ Person 1 ] [ Person 2 ] [ Person 3 ]
```

`Person 1` leaves first because they arrived first.

Queues are used in many situations, such as:

- Task scheduling.
- Print queues.
- Message processing.
- Breadth-first search.
- Waiting lines.
- Processing requests in order.

## Core Concept

A queue has two main operations:

```text
enqueue = add an item to the back
dequeue = remove an item from the front
```

In Python, we usually use `collections.deque` for queues.

```python
from collections import deque

queue = deque()

queue.append("A")
queue.append("B")
queue.append("C")

print(queue.popleft())
```

Output:

```text
A
```

`A` is removed first because it was added first.

## Technical Breakdown

### Basic Queue

```python
from collections import deque

queue = deque()

queue.append("task 1")
queue.append("task 2")
queue.append("task 3")

print(queue.popleft())
print(queue)
```

Output:

```text
task 1
deque(['task 2', 'task 3'])
```

### Why Not Use List for Queue?

A Python list can remove from the front using `pop(0)`, but it is inefficient for large lists.

```python
items = [1, 2, 3]

print(items.pop(0))
```

Output:

```text
1
```

This works, but removing the first item forces other items to shift left.

That can be `O(n)`.

With `deque`, removing from the front using `popleft()` is efficient.

### Deque

A deque means **double-ended queue**.

It allows efficient operations from both ends:

```text
append()      add to right
appendleft()  add to left
pop()         remove from right
popleft()     remove from left
```

Example:

```python
from collections import deque

dq = deque()

dq.append("right")
dq.appendleft("left")

print(dq)
print(dq.pop())
print(dq.popleft())
```

Output:

```text
deque(['left', 'right'])
right
left
```

## Try it Yourself

Change the task names and observe the order.

```python-run
from collections import deque

queue = deque()

queue.append("A")
queue.append("B")
queue.append("C")

print("Before dequeue:", queue)

first = queue.popleft()

print("Removed:", first)
print("After dequeue:", queue)
```

## Best Practices

Use `deque` when you need queue behavior.

Avoid using `list.pop(0)` for large data because it can be slow.

Common operation costs with `deque`:

```text
append right: O(1)
append left: O(1)
pop right: O(1)
pop left: O(1)
```

Use a queue when the earliest item should be processed first.

## Concept Summary

A queue follows the **First In, First Out** rule.

Key ideas:

```text
enqueue adds to the back
dequeue removes from the front
deque supports efficient operations from both ends
```

In Python, `collections.deque` is the recommended structure for queue behavior.
