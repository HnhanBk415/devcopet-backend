# The if Statement

The `if` statement is one of the most important tools in programming. It lets your program decide whether a block of code should run.

---

## Learning Goals

By the end of this lesson, you should be able to:

- `if` runs code only when a condition is true.
- A colon is required after the condition.
- Indented lines form the `if` block.

---

## 1. Basic if syntax

Write `if`, then a condition, then a colon. The indented lines below run only if the condition is true.

```python
score = 80
if score >= 70:
    print("You passed!")
```

Output:

```text
You passed!
```

---

## 2. Indentation matters

Python uses indentation to know which lines belong inside the `if` block.

```python
temperature = 35
if temperature > 30:
    print("It is hot.")
print("Weather check complete.")
```

Output:

```text
It is hot.
Weather check complete.
```

---

## 3. When condition is false

If the condition is false, the indented block is skipped.

```python
score = 50
if score >= 70:
    print("You passed!")
print("Done")
```

Output:

```text
Done
```

---

## Mini Practice

1. Write an `if` statement that checks if age is at least 18.
2. Write an `if` statement that checks if a score is 100.
3. Experiment with true and false conditions.

---

## Summary

- `if` runs code only when a condition is true.
- A colon is required after the condition.
- Indented lines form the `if` block.

Next, you will add an alternative path with `else`.
