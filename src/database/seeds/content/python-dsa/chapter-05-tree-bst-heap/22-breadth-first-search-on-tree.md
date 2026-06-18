# Breadth-First Search on Tree

## Purpose and Use Case

Breadth-First Search, often called BFS, visits a tree level by level.

Instead of going deep into one branch first, BFS visits all nodes on the current level before moving to the next level.

BFS on trees is useful for:

- Level-order traversal.
- Finding the shortest path in unweighted structures.
- Printing nodes by level.
- Finding the minimum depth of a tree.
- Processing hierarchical data one layer at a time.

## Core Concept

Assume this tree:

```text
        A
       / \
      B   C
     / \   \
    D   E   F
```

BFS visits nodes by level:

```text
A
B C
D E F
```

Output order:

```text
A, B, C, D, E, F
```

BFS uses a queue.

A queue follows:

```text
First In, First Out
```

The first node added is the first node processed.

## Technical Breakdown

First, import `deque`:

```python
from collections import deque
```

Define a tree node:

```python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
```

BFS code:

```python
from collections import deque

def bfs(root):
    if root is None:
        return

    queue = deque()
    queue.append(root)

    while queue:
        node = queue.popleft()
        print(node.value)

        if node.left is not None:
            queue.append(node.left)

        if node.right is not None:
            queue.append(node.right)
```

## Full Example

```python
from collections import deque

class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def bfs(root):
    if root is None:
        return

    queue = deque()
    queue.append(root)

    while queue:
        node = queue.popleft()
        print(node.value)

        if node.left is not None:
            queue.append(node.left)

        if node.right is not None:
            queue.append(node.right)

root = TreeNode("A")
root.left = TreeNode("B")
root.right = TreeNode("C")
root.left.left = TreeNode("D")
root.left.right = TreeNode("E")
root.right.right = TreeNode("F")

bfs(root)
```

Output:

```text
A
B
C
D
E
F
```

## Try it Yourself

Add more nodes and observe the BFS order.

```python-run
from collections import deque

class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def bfs(root):
    if root is None:
        return

    queue = deque()
    queue.append(root)

    while queue:
        node = queue.popleft()
        print(node.value)

        if node.left is not None:
            queue.append(node.left)

        if node.right is not None:
            queue.append(node.right)

root = TreeNode("A")
root.left = TreeNode("B")
root.right = TreeNode("C")
root.left.left = TreeNode("D")
root.left.right = TreeNode("E")
root.right.right = TreeNode("F")

bfs(root)
```

## Why BFS Uses a Queue

The queue stores nodes waiting to be processed.

Steps:

```text
1. Add root to queue.
2. Remove the front node.
3. Visit it.
4. Add its children to the back.
5. Repeat until queue is empty.
```

This keeps nodes in level order.

## Best Practices

Use BFS when:

```text
You need level-by-level traversal
You need to process nodes by distance from the root
You need the shortest number of edges in an unweighted structure
```

Use `collections.deque` instead of a list for queue operations because `popleft()` is efficient.

## Concept Summary

BFS visits a tree level by level.

Key ideas:

```text
BFS uses a queue
Visit root first
Then visit children
Then visit grandchildren
```

BFS is also important for graph traversal, which appears in the next chapter.
