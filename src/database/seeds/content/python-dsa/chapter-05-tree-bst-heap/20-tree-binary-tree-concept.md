# Tree and Binary Tree Concept

## Purpose and Use Case

A tree is a data structure used to represent hierarchical relationships.

Unlike a list, where items are stored in a straight line, a tree branches out.

Trees are used in many real systems, such as:

- File systems.
- HTML documents.
- Organization charts.
- Game decision trees.
- Search structures.
- Databases and indexing.
- Syntax trees in compilers.

In DSA, trees are important because many advanced structures are based on tree ideas.

## Core Concept

A tree is made of nodes.

Each node can connect to other nodes below it.

Example:

```text
        A
       / \
      B   C
     / \
    D   E
```

Important terms:

```text
Root   = the top node
Parent = a node that has children
Child  = a node below another node
Leaf   = a node with no children
Edge   = a connection between two nodes
```

In the example:

```text
A is the root
B and C are children of A
D and E are children of B
C, D, and E are leaf nodes
```

## Binary Tree

A binary tree is a tree where each node has at most two children.

The two children are usually called:

```text
left child
right child
```

Example:

```text
        10
       /  \
      5    15
     / \     \
    2   7     20
```

Each node has at most two children.

## Technical Breakdown

In Python, we can represent a binary tree node using a class.

```python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
```

Now create a small tree:

```python
root = TreeNode("A")
root.left = TreeNode("B")
root.right = TreeNode("C")
root.left.left = TreeNode("D")
root.left.right = TreeNode("E")
```

This creates:

```text
        A
       / \
      B   C
     / \
    D   E
```

To access values:

```python
print(root.value)
print(root.left.value)
print(root.right.value)
```

Output:

```text
A
B
C
```

## Try it Yourself

Change the node values and print different parts of the tree.

```python-run
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

root = TreeNode("A")
root.left = TreeNode("B")
root.right = TreeNode("C")
root.left.left = TreeNode("D")
root.left.right = TreeNode("E")

print(root.value)
print(root.left.value)
print(root.right.value)
print(root.left.left.value)
```

## Why Trees Are Different from Lists

A list is linear:

```text
10 -> 20 -> 30 -> 40
```

A tree is hierarchical:

```text
        10
       /  \
      5    15
```

In a list, we usually move from one item to the next.

In a tree, we choose branches.

This makes trees useful for representing choices, categories, and nested data.

## Best Practices

When learning trees, draw diagrams.

Tree problems become much easier when you can see:

```text
Which node is the root
Which nodes are children
Which nodes are leaves
Which direction the traversal moves
```

Start with small trees before working with large recursive tree problems.

## Concept Summary

A tree stores data in a hierarchy.

Key ideas:

```text
Root is the top node
Parent nodes have children
Leaf nodes have no children
Binary tree nodes have at most two children
```

Trees are a foundation for binary search trees, heaps, tries, and many advanced DSA topics.
