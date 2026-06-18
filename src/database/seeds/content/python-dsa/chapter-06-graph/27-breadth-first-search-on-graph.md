# Breadth-First Search on Graph

## Purpose and Use Case

Breadth-First Search, or BFS, is an algorithm for visiting graph nodes.

BFS explores nodes level by level.

Starting from one node, BFS visits all nearby nodes first before moving farther away.

BFS is useful for:

- Finding whether a node is reachable.
- Finding the shortest path in an unweighted graph.
- Exploring networks level by level.
- Finding connected components.
- Solving maze-like problems.

## Core Concept

BFS uses a queue.

A queue follows:

```text
First In, First Out
```

Assume this graph:

```text
A --- B
|     |
C --- D
```

Adjacency list:

```python
graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D"],
    "D": ["B", "C"],
}
```

If BFS starts from `A`, one possible order is:

```text
A, B, C, D
```

## Technical Breakdown

BFS needs:

```text
queue = nodes waiting to be visited
visited = nodes already seen
```

Python code:

```python
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque()

    visited.add(start)
    queue.append(start)

    while queue:
        node = queue.popleft()
        print(node)

        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
```

## Full Example

```python
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque()

    visited.add(start)
    queue.append(start)

    while queue:
        node = queue.popleft()
        print(node)

        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D"],
    "D": ["B", "C"],
}

bfs(graph, "A")
```

Output:

```text
A
B
C
D
```

## Try it Yourself

Change the starting node and observe the traversal order.

```python-run
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque()

    visited.add(start)
    queue.append(start)

    while queue:
        node = queue.popleft()
        print(node)

        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D"],
    "D": ["B", "C"],
}

bfs(graph, "A")
```

## Why We Need Visited

Graphs can contain cycles.

Example:

```text
A --- B
|     |
C --- D
```

If we do not track visited nodes, BFS may keep moving around the cycle forever.

The `visited` set prevents repeated visits.

```python
if neighbor not in visited:
    visited.add(neighbor)
    queue.append(neighbor)
```

## BFS Time Complexity

For a graph with:

```text
V = number of vertices
E = number of edges
```

BFS time complexity is:

```text
O(V + E)
```

This is because BFS visits each node and checks each edge.

## Best Practices

Use BFS when:

```text
You need level-by-level exploration
You need shortest path in an unweighted graph
You need to find reachable nodes
```

Always use a visited set to avoid infinite loops.

Use `collections.deque` for the queue.

## Concept Summary

BFS explores a graph level by level.

Key ideas:

```text
BFS uses a queue
Visited set prevents repeated visits
BFS can find shortest paths in unweighted graphs
Time complexity is O(V + E)
```

BFS is one of the most important graph algorithms.
