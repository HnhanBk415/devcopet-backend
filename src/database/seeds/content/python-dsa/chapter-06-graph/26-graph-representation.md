# Graph Representation

## Purpose and Use Case

Before we can run graph algorithms, we need a way to store the graph in code.

This is called graph representation.

The same graph can be represented in different ways.

Common graph representations include:

- Edge list.
- Adjacency list.
- Adjacency matrix.

Each representation has different strengths.

## Core Concept

Assume this graph:

```text
A --- B
|     |
C --- D
```

Edges:

```text
A-B
A-C
B-D
C-D
```

We can store this graph in different formats.

## Edge List

An edge list stores all connections as pairs.

```python
edges = [
    ("A", "B"),
    ("A", "C"),
    ("B", "D"),
    ("C", "D"),
]
```

This is simple and easy to read.

It is useful when the main thing you need is the list of edges.

However, finding all neighbors of a node may require scanning the whole edge list.

## Adjacency List

An adjacency list stores each node and its neighbors.

```python
graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D"],
    "D": ["B", "C"],
}
```

This is one of the most common graph representations.

It is efficient for finding neighbors.

Example:

```python
print(graph["A"])
```

Output:

```text
['B', 'C']
```

## Adjacency Matrix

An adjacency matrix uses a grid of 0s and 1s.

For nodes:

```text
A, B, C, D
```

Matrix:

```text
    A B C D
A [0 1 1 0]
B [1 0 0 1]
C [1 0 0 1]
D [0 1 1 0]
```

`1` means there is an edge.

`0` means there is no edge.

In Python:

```python
matrix = [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
]
```

## Technical Breakdown

For most beginner graph problems in Python, adjacency list is the easiest and most useful.

Example:

```python
graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D"],
    "D": ["B", "C"],
}

for neighbor in graph["A"]:
    print(neighbor)
```

Output:

```text
B
C
```

## Try it Yourself

Change the graph and print the neighbors of another node.

```python-run
graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D"],
    "D": ["B", "C"],
}

print("Neighbors of A:")

for neighbor in graph["A"]:
    print(neighbor)
```

## Directed Graph Representation

For a directed graph:

```text
A ---> B
A ---> C
B ---> D
```

Adjacency list:

```python
graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": [],
    "D": [],
}
```

Here, `A` points to `B` and `C`.

But `B` does not automatically point back to `A`.

## Weighted Graph Representation

For weighted graphs, store the neighbor and weight.

```python
graph = {
    "A": [("B", 5), ("C", 2)],
    "B": [("A", 5), ("D", 4)],
    "C": [("A", 2), ("D", 7)],
    "D": [("B", 4), ("C", 7)],
}
```

Each pair means:

```text
(neighbor, weight)
```

## Best Practices

Use an adjacency list when:

```text
You need to find neighbors often
The graph is not extremely dense
You are doing BFS or DFS
```

Use an edge list when:

```text
You mainly process edges
You are learning graph basics
```

Use an adjacency matrix when:

```text
You need very fast edge checking between two nodes
The graph is small or dense
```

## Concept Summary

Graphs can be stored in different ways.

Key ideas:

```text
Edge list = list of connections
Adjacency list = each node maps to neighbors
Adjacency matrix = grid showing whether edges exist
```

For most Python DSA graph problems, adjacency lists are the most common choice.
