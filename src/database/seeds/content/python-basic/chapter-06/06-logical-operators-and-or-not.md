# Logical Operators: and, or, not

Logical operators let you combine or change conditions.

Python has three important logical operators:

```python
and
or
not
```

---

## and

`and` is true only when both conditions are true.

```python
age = 20
has_ticket = True

if age >= 18 and has_ticket:
    print("You can enter")
```

---

## or

`or` is true when at least one condition is true.

```python
is_student = True
has_coupon = False

if is_student or has_coupon:
    print("Discount available")
```

---

## not

`not` reverses a boolean value.

```python
is_closed = False

if not is_closed:
    print("The shop is open")
```

---

## Summary

Use `and` when all conditions must be true, `or` when at least one condition must be true, and `not` to reverse a condition.
