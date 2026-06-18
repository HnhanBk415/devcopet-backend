# Connected Components and Shortest Path Introduction

## Purpose and Use Case

After learning BFS and DFS, we can use them to solve common graph problems.

Two important graph ideas are:

```text
Connected components
Shortest path
```

Connected components help us find separate groups in a graph.

Shortest path helps us find the minimum number of steps between nodes.

These ideas are useful in:

- Social networks.
- Road maps.
- Game maps.
- Computer networks.
- Course dependency systems.
- Recommendation systems.

## Core Concept

## Connected Components

A connected component is a group of nodes that are connected to each other.

Example:

```text
A --- B      D --- E
|
C
```

This graph has two connected components:

```text
Component 1: A, B, C
Component 2: D, E
```

There is no edge connecting the first group to the second group.

## Shortest Path

In an unweighted graph, the shortest path is the path with the fewest edges.

Example:

```text
A --- B --- D
|           |
C ---------+
```

From `A` to `D`, possible paths:

```text
A -> B -> D
A -> C -> D
```

Both have 2 edges.

BFS is commonly used to find shortest paths in unweighted graphs.

## Technical Breakdown

## Finding Connected Components

We can use DFS to find all connected components.

```python
def dfs(graph, node, visited, component):
    visited.add(node)
    component.append(node)

    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited, component)

def connected_components(graph):
    visited = set()
    components = []

    for node in graph:
        if node not in visited:
            component = []
            dfs(graph, node, visited, component)
            components.append(component)

    return components
```

Full example:

```python
graph = {
    "A": ["B", "C"],
    "B": ["A"],
    "C": ["A"],
    "D": ["E"],
    "E": ["D"],
}

print(connected_components(graph))
```

Output:

```text
[['A', 'B', 'C'], ['D', 'E']]
```

## Try it Yourself

Add another disconnected node and observe the components.

```python-run
def dfs(graph, node, visited, component):
    visited.add(node)
    component.append(node)

    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited, component)

def connected_components(graph):
    visited = set()
    components = []

    for node in graph:
        if node not in visited:
            component = []
            dfs(graph, node, visited, component)
            components.append(component)

    return components

graph = {
    "A": ["B", "C"],
    "B": ["A"],
    "C": ["A"],
    "D": ["E"],
    "E": ["D"],
}

print(connected_components(graph))
```

## Shortest Path with BFS

For an unweighted graph, BFS can find the shortest path distance.

```python
from collections import deque

def shortest_distance(graph, start, target):
    visited = set()
    queue = deque()

    visited.add(start)
    queue.append((start, 0))

    while queue:
        node, distance = queue.popleft()

        if node == target:
            return distance

        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, distance + 1))

    return -1
```

Example:

```python
graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D"],
    "D": ["B", "C"],
}

print(shortest_distance(graph, "A", "D"))
```

Output:

```text
2
```

The shortest distance from `A` to `D` is 2 edges.

## Important Note About Weighted Graphs

BFS works for shortest path in unweighted graphs.

If edges have different weights, BFS is not enough.

For weighted graphs, algorithms like Dijkstra's algorithm are often used.

This course only introduces the basic idea.

## Best Practices

Use DFS or BFS for connected components.

Use BFS for shortest path when:

```text
The graph is unweighted
Each edge has the same cost
You need the fewest number of edges
```

Use a visited set to avoid repeated work.

For weighted graphs, learn Dijkstra later in an advanced DSA course.

## Concept Summary

Connected components and shortest paths are common graph problems.

Key ideas:

```text
Connected component = group of connected nodes
Disconnected graph = graph with multiple separate groups
BFS finds shortest path in unweighted graphs
DFS or BFS can find connected components
```

This lesson completes the foundation of graph traversal and prepares you for advanced graph algorithms later.
