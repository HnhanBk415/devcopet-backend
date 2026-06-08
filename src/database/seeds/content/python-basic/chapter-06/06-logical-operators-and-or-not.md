# Logical Operators: and, or, not

Logical operators help build more complex conditions. Python has three important beginner logical operators: `and`, `or`, and `not`.

---

## Learning Goals

By the end of this lesson, you should be able to:

- `and` requires both sides to be true.
- `or` requires at least one side to be true.
- `not` reverses a boolean value.

---

## 1. and

`and` is true only when both conditions are true.

```python
age = 20
has_id = True
if age >= 18 and has_id:
    print("Entry allowed")
```

Output:

```text
Entry allowed
```

---

## 2. or

`or` is true when at least one condition is true.

```python
has_coupon = False
is_member = True
if has_coupon or is_member:
    print("Discount available")
```

Output:

```text
Discount available
```

---

## 3. not

`not` reverses a boolean value.

```python
is_raining = False
if not is_raining:
    print("No umbrella needed")
```

Output:

```text
No umbrella needed
```

---

## Mini Practice

1. Write a condition using `and`.
2. Write a condition using `or`.
3. Use `not` to reverse a boolean variable.

---

## Summary

- `and` requires both sides to be true.
- `or` requires at least one side to be true.
- `not` reverses a boolean value.

Next, you will review common mistakes in conditions.
