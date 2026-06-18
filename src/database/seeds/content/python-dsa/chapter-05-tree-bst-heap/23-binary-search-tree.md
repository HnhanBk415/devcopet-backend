# Binary Search Tree

## Purpose and Use Case

A Binary Search Tree, or BST, is a special type of binary tree.

It keeps values arranged so that searching can be efficient.

BSTs are useful for understanding:

- Ordered data.
- Fast search.
- Fast insertion.
- Tree-based lookup.
- How sorted structure improves performance.

A BST is also a common interview and DSA topic.

## Core Concept

A Binary Search Tree follows this rule:

```text
For every node:
- values smaller than the node go to the left
- values greater than the node go to the right
```

Example:

```text
        8
       / \
      3   10
     / \    \
    1   6    14
```

For the root `8`:

```text
3 is smaller, so it is on the left
10 is greater, so it is on the right
```

For node `3`:

```text
1 is smaller, so it is on the left
6 is greater, so it is on the right
```

## Technical Breakdown

Define a node:

```python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
```

## Search in a BST

To search for a value:

```text
If target equals current node, found it.
If target is smaller, go left.
If target is greater, go right.
```

Code:

```python
def search_bst(root, target):
    current = root

    while current is not None:
        if current.value == target:
            return True
        elif target < current.value:
            current = current.left
        else:
            current = current.right

    return False
```

## Full Search Example

```python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def search_bst(root, target):
    current = root

    while current is not None:
        if current.value == target:
            return True
        elif target < current.value:
            current = current.left
        else:
            current = current.right

    return False

root = TreeNode(8)
root.left = TreeNode(3)
root.right = TreeNode(10)
root.left.left = TreeNode(1)
root.left.right = TreeNode(6)
root.right.right = TreeNode(14)

print(search_bst(root, 6))
print(search_bst(root, 7))
```

Output:

```text
True
False
```

## Try it Yourself

Change the target and observe whether it is found.

```python-run
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def search_bst(root, target):
    current = root

    while current is not None:
        if current.value == target:
            return True
        elif target < current.value:
            current = current.left
        else:
            current = current.right

    return False

root = TreeNode(8)
root.left = TreeNode(3)
root.right = TreeNode(10)
root.left.left = TreeNode(1)
root.left.right = TreeNode(6)
root.right.right = TreeNode(14)

print(search_bst(root, 6))
```

## Insert into a BST

To insert a value, follow the BST rule until you find an empty spot.

```python
def insert_bst(root, value):
    if root is None:
        return TreeNode(value)

    if value < root.value:
        root.left = insert_bst(root.left, value)
    elif value > root.value:
        root.right = insert_bst(root.right, value)

    return root
```

Example:

```python
root = None

for value in [8, 3, 10, 1, 6, 14]:
    root = insert_bst(root, value)
```

## Time Complexity

If the BST is balanced:

```text
Search: O(log n)
Insert: O(log n)
```

If the BST becomes very unbalanced:

```text
Search: O(n)
Insert: O(n)
```

Example of a bad unbalanced BST:

```text
1
 \
  2
   \
    3
     \
      4
```

This behaves more like a linked list.

## Best Practices

Remember the BST rule:

```text
left < node < right
```

When solving BST problems, use the order property.

Do not treat a BST like a normal binary tree if the problem allows you to use the sorted structure.

## Concept Summary

A Binary Search Tree is a binary tree with an ordering rule.

Key ideas:

```text
Smaller values go left
Greater values go right
Search follows the value comparison
Balanced BST operations can be O(log n)
Unbalanced BST operations can become O(n)
```
