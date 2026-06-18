# Heap and Priority Queue

## Purpose and Use Case

A heap is a tree-like data structure used to quickly access the highest or lowest priority item.

In Python, heaps are commonly used to build priority queues.

A priority queue is like a normal queue, but items are removed by priority instead of arrival order.

Heaps are useful for:

- Task scheduling.
- Finding the smallest or largest item efficiently.
- Dijkstra's shortest path algorithm.
- Top K problems.
- Event simulation.
- Priority-based systems.

## Core Concept

A heap keeps the most important item at the top.

Python's `heapq` module implements a **min-heap**.

In a min-heap:

```text
The smallest value has the highest priority
The smallest value is removed first
```

Example:

```text
push 5
push 2
push 8
push 1

pop -> 1
pop -> 2
```

## Technical Breakdown

Python provides the `heapq` module.

```python
import heapq
```

Create an empty heap:

```python
heap = []
```

Add items using `heappush()`:

```python
heapq.heappush(heap, 5)
heapq.heappush(heap, 2)
heapq.heappush(heap, 8)
heapq.heappush(heap, 1)
```

Remove the smallest item using `heappop()`:

```python
print(heapq.heappop(heap))
print(heapq.heappop(heap))
```

Output:

```text
1
2
```

## Full Example

```python
import heapq

heap = []

heapq.heappush(heap, 5)
heapq.heappush(heap, 2)
heapq.heappush(heap, 8)
heapq.heappush(heap, 1)

print(heapq.heappop(heap))
print(heapq.heappop(heap))
print(heap)
```

Possible output:

```text
1
2
[5, 8]
```

The internal list may not look fully sorted, but the heap property is maintained.

## Try it Yourself

Add more numbers and observe the pop order.

```python-run
import heapq

heap = []

heapq.heappush(heap, 5)
heapq.heappush(heap, 2)
heapq.heappush(heap, 8)
heapq.heappush(heap, 1)

print(heapq.heappop(heap))
print(heapq.heappop(heap))
print(heap)
```

## Priority Queue with Tuples

You can store tasks with priorities using tuples.

```python
import heapq

tasks = []

heapq.heappush(tasks, (2, "Study strings"))
heapq.heappush(tasks, (1, "Fix syntax error"))
heapq.heappush(tasks, (3, "Review recursion"))

print(heapq.heappop(tasks))
```

Output:

```text
(1, 'Fix syntax error')
```

The item with the smallest priority number is removed first.

## Max-Heap Trick

Python's `heapq` is a min-heap.

If you want max-heap behavior, you can store negative values.

```python
import heapq

heap = []

heapq.heappush(heap, -5)
heapq.heappush(heap, -2)
heapq.heappush(heap, -8)

largest = -heapq.heappop(heap)

print(largest)
```

Output:

```text
8
```

## Time Complexity

Common heap operation costs:

```text
heappush: O(log n)
heappop: O(log n)
peek smallest item: O(1)
```

Peeking means reading `heap[0]` without removing it.

```python
smallest = heap[0]
```

## Best Practices

Use a heap when you repeatedly need the smallest or highest-priority item.

Use `heapq` for priority queues in Python.

Remember:

```text
heapq is a min-heap
heap[0] is the smallest item
heappop removes the smallest item
```

Do not expect the internal heap list to always appear fully sorted.

The heap only guarantees that the smallest item is at index `0`.

## Concept Summary

A heap helps manage priority.

Key ideas:

```text
Python heapq is a min-heap
Smallest item comes out first
Priority queues can be built with tuples
heappush and heappop are O(log n)
heap[0] gives the smallest item
```

Heaps are important for efficient priority-based algorithms.
