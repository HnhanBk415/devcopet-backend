# The if elif else Statement

When a program has more than two possible outcomes, use `elif` to check additional conditions before the final `else`.

---

## Learning Goals

By the end of this lesson, you should be able to:

- Use `elif` for additional conditions.
- Python checks branches from top to bottom.
- Only the first true branch runs.

---

## 1. Multiple branches

Python checks the `if` first, then each `elif` in order, then `else` if none are true.

```python
score = 85
if score >= 90:
    print("A")
elif score >= 80:
    print("B")
else:
    print("Keep practicing")
```

Output:

```text
B
```

---

## 2. Order matters

Put more specific or higher-priority conditions first.

```python
temperature = 38
if temperature >= 40:
    print("Very hot")
elif temperature >= 30:
    print("Hot")
else:
    print("Comfortable")
```

Output:

```text
Hot
```

---

## 3. One branch only

After Python finds the first true branch, it skips the rest.

```python
number = 10
if number > 0:
    print("Positive")
elif number == 10:
    print("Ten")
```

Output:

```text
Positive
```

---

## Mini Practice

1. Create grade logic using if/elif/else.
2. Test the order of conditions.
3. Write a menu choice with three options.

---

## Summary

- Use `elif` for additional conditions.
- Python checks branches from top to bottom.
- Only the first true branch runs.

Next, you will combine conditions using logical operators.
