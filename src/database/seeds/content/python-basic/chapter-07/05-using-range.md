# Using range()

The `range()` function is often used with `for` loops. It can create simple counting sequences with a start, stop, and step.

---

## Learning Goals

By the end of this lesson, you should be able to:

- `range(stop)` starts at 0.
- The stop value is not included.
- The step controls how values change.

---

## 1. range(stop)

With one argument, range starts at 0 and stops before the given number.

```python
for i in range(5):
    print(i)
```

Output:

```text
0
1
2
3
4
```

---

## 2. range(start, stop)

With two arguments, range starts at the first number and stops before the second.

```python
for i in range(2, 6):
    print(i)
```

Output:

```text
2
3
4
5
```

---

## 3. range(start, stop, step)

With three arguments, the third controls how much the number changes each time.

```python
for i in range(0, 10, 2):
    print(i)
```

Output:

```text
0
2
4
6
8
```

---

## Mini Practice

1. Print numbers 1 to 10 using range.
2. Print even numbers from 0 to 10.
3. Print a countdown using a negative step.

---

## Summary

- `range(stop)` starts at 0.
- The stop value is not included.
- The step controls how values change.

Next, you will learn how `break` and `continue` change loop flow.
