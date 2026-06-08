# Using range()

The `range()` function creates a sequence of numbers. It is often used with `for` loops.

---

## range(stop)

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

`range(5)` starts at 0 and stops before 5.

---

## range(start, stop)

```python
for i in range(1, 6):
    print(i)
```

Output:

```text
1
2
3
4
5
```

---

## range(start, stop, step)

```python
for i in range(2, 11, 2):
    print(i)
```

Output:

```text
2
4
6
8
10
```

The third value is the step size.

---

## Summary

`range()` is useful for counting and repeating code a specific number of times. Remember that the stop value is not included.
