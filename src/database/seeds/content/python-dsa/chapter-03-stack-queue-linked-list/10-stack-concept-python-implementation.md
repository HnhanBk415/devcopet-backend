# Stack Concept and Python Implementation

## Purpose and Use Case

A stack is a linear data structure that follows the **Last In, First Out** rule.

This means the last item added to the stack is the first item removed.

You can imagine a stack of plates:

```text
Top
[ Plate 3 ]  <- removed first
[ Plate 2 ]
[ Plate 1 ]  <- added first
Bottom
```

Stacks are used in many programming situations, such as:

- Undo and redo features.
- Browser back history.
- Function call stack.
- Checking balanced parentheses.
- Reversing data.
- Depth-first search.

## Core Concept

A stack has two main operations:

```text
push = add an item to the top
pop  = remove the item from the top
```

In Python, we can use a list as a simple stack.

```python
stack = []

stack.append("A")
stack.append("B")
stack.append("C")

print(stack.pop())
```

Output:

```text
C
```

`C` is removed first because it was added last.

## Technical Breakdown

Let’s build a small stack example.

```python
stack = []

stack.append("task 1")
stack.append("task 2")
stack.append("task 3")

print(stack)
print(stack.pop())
print(stack)
```

Output:

```text
['task 1', 'task 2', 'task 3']
task 3
['task 1', 'task 2']
```

The last item added was `"task 3"`, so it is removed first.

### Peek

Sometimes we want to look at the top item without removing it.

```python
stack = [10, 20, 30]

top = stack[-1]

print(top)
print(stack)
```

Output:

```text
30
[10, 20, 30]
```

This is called **peek**.

### Empty Stack Check

Before popping, we should check if the stack is empty.

```python
stack = []

if stack:
    print(stack.pop())
else:
    print("Stack is empty")
```

Output:

```text
Stack is empty
```

## Try it Yourself

Change the pushed values and observe the order of removal.

```python-run
stack = []

stack.append("A")
stack.append("B")
stack.append("C")

print("Stack before pop:", stack)

removed = stack.pop()

print("Removed:", removed)
print("Stack after pop:", stack)
```

## Best Practices

Use a stack when the most recent item should be handled first.

Common operation costs with Python list:

```text
append at end: O(1)
pop from end: O(1)
peek last item: O(1)
```

Do not use `pop(0)` for stack behavior. A stack should remove from the same end where it adds.

## Concept Summary

A stack follows the **Last In, First Out** rule.

Key ideas:

```text
push adds to the top
pop removes from the top
peek reads the top item without removing it
```

In Python, a list can be used as a simple stack with `append()` and `pop()`.
