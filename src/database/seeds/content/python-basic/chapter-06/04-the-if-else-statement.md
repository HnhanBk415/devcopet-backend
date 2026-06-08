# The if else Statement

An `if else` statement lets your program do one thing when a condition is true and another thing when it is false.

---

## Learning Goals

By the end of this lesson, you should be able to:

- `else` handles the false case.
- Only one branch runs in an `if else`.
- Clear conditions make branches easier to read.

---

## 1. Basic if else

The `else` block runs when the `if` condition is false.

```python
score = 60
if score >= 70:
    print("Passed")
else:
    print("Try again")
```

Output:

```text
Try again
```

---

## 2. Only one path runs

In an `if else`, Python chooses exactly one of the two blocks.

```python
is_member = True
if is_member:
    print("Discount applied")
else:
    print("Regular price")
```

Output:

```text
Discount applied
```

---

## 3. Use clear conditions

Good conditions make the two outcomes easy to understand.

```python
age = 15
if age >= 18:
    print("Adult ticket")
else:
    print("Child ticket")
```

Output:

```text
Child ticket
```

---

## Mini Practice

1. Write an if else for pass/fail.
2. Write an if else for adult/minor.
3. Change values to test both branches.

---

## Summary

- `else` handles the false case.
- Only one branch runs in an `if else`.
- Clear conditions make branches easier to read.

Next, you will handle more than two choices with `elif`.
