# Tree Traversal

## Purpose and Use Case

Tree traversal means visiting every node in a tree.

Because a tree branches, there are different ways to visit nodes.

Tree traversal is used when you need to:

- Print all nodes.
- Search for a value.
- Calculate a tree result.
- Convert a tree into a list.
- Process hierarchical data.
- Visit nodes in a specific order.

For binary trees, three common depth-first traversals are:

```text
Preorder
Inorder
Postorder
```

## Core Concept

Assume this tree:

```text
        A
       / \
      B   C
     / \
    D   E
```

Traversal order depends on when we visit the root.

```text
Preorder  = Root, Left, Right
Inorder   = Left, Root, Right
Postorder = Left, Right, Root
```

## Technical Breakdown

First, define the tree node:

```python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
```

Create a tree:

```python
root = TreeNode("A")
root.left = TreeNode("B")
root.right = TreeNode("C")
root.left.left = TreeNode("D")
root.left.right = TreeNode("E")
```

This tree looks like:

```text
        A
       / \
      B   C
     / \
    D   E
```

## Preorder Traversal

Preorder visits:

```text
Root -> Left -> Right
```

Code:

```python
def preorder(node):
    if node is None:
        return

    print(node.value)
    preorder(node.left)
    preorder(node.right)
```

Output:

```text
A
B
D
E
C
```

## Inorder Traversal

Inorder visits:

```text
Left -> Root -> Right
```

Code:

```python
def inorder(node):
    if node is None:
        return

    inorder(node.left)
    print(node.value)
    inorder(node.right)
```

Output:

```text
D
B
E
A
C
```

## Postorder Traversal

Postorder visits:

```text
Left -> Right -> Root
```

Code:

```python
def postorder(node):
    if node is None:
        return

    postorder(node.left)
    postorder(node.right)
    print(node.value)
```

Output:

```text
D
E
B
C
A
```

## Try it Yourself

Run preorder traversal and change it to inorder or postorder.

```python-run
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def preorder(node):
    if node is None:
        return

    print(node.value)
    preorder(node.left)
    preorder(node.right)

root = TreeNode("A")
root.left = TreeNode("B")
root.right = TreeNode("C")
root.left.left = TreeNode("D")
root.left.right = TreeNode("E")

preorder(root)
```

## Why Traversal Uses Recursion

A tree naturally contains smaller trees.

For example:

```text
root.left is also a tree
root.right is also a tree
```

That is why recursion works well for tree traversal.

Each recursive call handles a smaller subtree.

## Best Practices

Remember the position of the root:

```text
Preorder: root first
Inorder: root in the middle
Postorder: root last
```

For binary search trees, inorder traversal is especially important because it visits values in sorted order.

## Concept Summary

Tree traversal means visiting every node.

Key ideas:

```text
Preorder = Root, Left, Right
Inorder = Left, Root, Right
Postorder = Left, Right, Root
```

Tree traversal is often implemented using recursion because each subtree can be processed like a smaller tree.
