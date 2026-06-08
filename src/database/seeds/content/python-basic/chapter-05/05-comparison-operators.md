# Comparison Operators

Comparison operators ask questions about values. The answer is always `True` or `False`.

---

## Learning Goals

By the end of this lesson, you should be able to:

- Comparisons return booleans.
- Use `==` for equality checks.
- Comparison results are useful in conditions.

---

## 1. Common comparisons

Python supports `>`, `<`, `>=`, `<=`, `==`, and `!=`.

```python
print(10 > 5)
print(10 == 5)
print(10 != 5)
```

Output:

```text
True
False
True
```

---

## 2. Equality uses ==

Use `==` to compare values. A single `=` is assignment, not comparison.

```python
score = 100
print(score == 100)
```

Output:

```text
True
```

---

## 3. Comparisons in variables

You can store a comparison result in a boolean variable.

```python
age = 20
is_adult = age >= 18
print(is_adult)
```

Output:

```text
True
```

---

## Mini Practice

1. Compare two numbers using `>`.
2. Check if a variable equals a value using `==`.
3. Store a comparison result in a variable.

---

## Summary

- Comparisons return booleans.
- Use `==` for equality checks.
- Comparison results are useful in conditions.

Next, you will learn assignment operators.
