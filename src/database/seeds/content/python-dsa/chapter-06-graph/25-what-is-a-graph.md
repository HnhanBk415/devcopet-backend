# What is a Graph?

## Purpose and Use Case

A graph is a data structure used to represent relationships.

Graphs are useful when data is connected in a network-like way instead of a simple line or hierarchy.

You can find graphs in many real-world systems, such as:

- Social networks.
- Maps and roads.
- Website links.
- Course prerequisites.
- Recommendation systems.
- Game maps.
- Computer networks.
- Dependency systems.

In DSA, graphs are very important because they help solve problems about connection, reachability, routes, and relationships.

## Core Concept

A graph is made of:

```text
vertices / nodes
edges / connections
```

Example:

```text
A --- B
|     |
C --- D
```

In this graph:

```text
A, B, C, D are nodes
A-B, A-C, B-D, C-D are edges
```

A node represents an object.

An edge represents a relationship between two objects.

## Directed and Undirected Graphs

### Undirected Graph

In an undirected graph, edges have no direction.

If `A` is connected to `B`, then `B` is also connected to `A`.

```text
A --- B
```

This can represent a friendship relationship.

```text
A is friends with B
B is friends with A
```

### Directed Graph

In a directed graph, edges have direction.

```text
A ---> B
```

This can represent a follow relationship.

```text
A follows B
B does not necessarily follow A
```

## Weighted and Unweighted Graphs

### Unweighted Graph

An unweighted graph only cares about whether nodes are connected.

```text
A --- B
```

### Weighted Graph

A weighted graph gives a cost or distance to each edge.

```text
A --5-- B
```

The `5` may mean distance, time, cost, or priority.

## Technical Breakdown

A graph can be described using nodes and edges.

Example:

```python
nodes = ["A", "B", "C", "D"]

edges = [
    ("A", "B"),
    ("A", "C"),
    ("B", "D"),
    ("C", "D"),
]
```

This edge list means:

```text
A is connected to B
A is connected to C
B is connected to D
C is connected to D
```

## Try it Yourself

Change the edges and see how the graph connections change.

```python-run
nodes = ["A", "B", "C", "D"]

edges = [
    ("A", "B"),
    ("A", "C"),
    ("B", "D"),
    ("C", "D"),
]

for edge in edges:
    print(edge[0], "is connected to", edge[1])
```

## Why Graphs Are Different from Trees

A tree is a special kind of graph.

Trees have a clear root and usually do not have cycles.

Graphs are more general.

A graph can have:

```text
No root
Cycles
Multiple paths between nodes
Disconnected parts
Directed or undirected edges
Weighted or unweighted edges
```

Example of a cycle:

```text
A --- B
|     |
C --- D
```

You can start at `A`, go to `B`, then `D`, then `C`, then back to `A`.

## Best Practices

When learning graphs, always ask:

```text
Are the edges directed or undirected?
Are the edges weighted or unweighted?
Can the graph have cycles?
Can the graph be disconnected?
What does a node represent?
What does an edge represent?
```

These questions help you choose the right algorithm.

## Concept Summary

A graph represents relationships between objects.

Key ideas:

```text
Node = object
Edge = connection
Undirected graph = two-way connection
Directed graph = one-way connection
Weighted graph = edges have cost
Unweighted graph = edges do not have cost
```

Graphs are powerful for modeling networks, routes, dependencies, and connections.
