# Common Conditional Mistakes

Conditions are powerful, but beginners often make a few common mistakes.

---

## Mistake 1: Using = Instead of ==

Incorrect:

```python
if age = 18:
    print("Age is 18")
```

Correct:

```python
if age == 18:
    print("Age is 18")
```

Use `=` for assignment and `==` for comparison.

---

## Mistake 2: Missing the Colon

Incorrect:

```python
if age >= 18
    print("Adult")
```

Correct:

```python
if age >= 18:
    print("Adult")
```

---

## Mistake 3: Wrong Indentation

Incorrect:

```python
if True:
print("Hello")
```

Correct:

```python
if True:
    print("Hello")
```

---

## Mistake 4: Conditions in the Wrong Order

```python
score = 95

if score >= 60:
    print("Passed")
elif score >= 90:
    print("Excellent")
```

The `Excellent` branch will never run. Check the higher score first.

---

## Summary

When writing conditions, check your comparison operators, colons, indentation, and condition order.
