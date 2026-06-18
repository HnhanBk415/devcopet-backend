# Depth-First Search on Graph

## Purpose and Use Case

Depth-First Search, or DFS, is another important graph traversal algorithm.

DFS explores as far as possible along one path before going back.

It is useful for:

- Exploring all reachable nodes.
- Detecting connected components.
- Solving maze-like problems.
- Topological sorting.
- Cycle detection.
- Backtracking-style problems.

DFS can be implemented using recursion or a stack.

## Core Concept

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

DFS starting from `A` may visit:

```text
A, B, D, C
```

The exact order depends on the neighbor order.

## Technical Breakdown

DFS with recursion:

```python
def dfs(graph, node, visited):
    if node in visited:
        return

    visited.add(node)
    print(node)

    for neighbor in graph[node]:
        dfs(graph, neighbor, visited)
```

Full example:

```python
def dfs(graph, node, visited):
    if node in visited:
        return

    visited.add(node)
    print(node)

    for neighbor in graph[node]:
        dfs(graph, neighbor, visited)

graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D"],
    "D": ["B", "C"],
}

visited = set()
dfs(graph, "A", visited)
```

Output:

```text
A
B
D
C
```

## Try it Yourself

Change the neighbor order and observe how DFS order changes.

```python-run
def dfs(graph, node, visited):
    if node in visited:
        return

    visited.add(node)
    print(node)

    for neighbor in graph[node]:
        dfs(graph, neighbor, visited)

graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D"],
    "D": ["B", "C"],
}

visited = set()
dfs(graph, "A", visited)
```

## DFS with a Stack

DFS can also be written with an explicit stack.

```python
def dfs_stack(graph, start):
    visited = set()
    stack = [start]

    while stack:
        node = stack.pop()

        if node in visited:
            continue

        visited.add(node)
        print(node)

        for neighbor in graph[node]:
            if neighbor not in visited:
                stack.append(neighbor)
```

Because a stack is Last In, First Out, the order may be different from recursive DFS.

## DFS vs BFS

```text
BFS:
- Uses queue
- Explores level by level
- Good for shortest path in unweighted graphs

DFS:
- Uses recursion or stack
- Explores deeply first
- Good for exploring components and recursive structures
```

Both are useful.

The best choice depends on the problem.

## DFS Time Complexity

For a graph with:

```text
V = number of vertices
E = number of edges
```

DFS time complexity is:

```text
O(V + E)
```

DFS visits each node and checks edges from each node.

## Best Practices

Use DFS when:

```text
You need to explore a whole connected area
You need recursive graph exploration
You need connected components
You need to search deeply before trying other paths
```

Always use a visited set.

Without visited tracking, DFS may loop forever in graphs with cycles.

## Concept Summary

DFS explores deeply before backtracking.

Key ideas:

```text
DFS can use recursion
DFS can use a stack
Visited set prevents repeated visits
DFS time complexity is O(V + E)
```

DFS and BFS are the two foundation algorithms for graph traversal.
