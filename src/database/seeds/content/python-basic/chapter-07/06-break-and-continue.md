# break and continue

Python provides two keywords that help control loops:

```python
break
continue
```

---

## break

`break` stops the loop immediately.

```python
for number in range(1, 6):
    if number == 3:
        break
    print(number)
```

Output:

```text
1
2
```

The loop stops when `number` becomes 3.

---

## continue

`continue` skips the current loop step and moves to the next one.

```python
for number in range(1, 6):
    if number == 3:
        continue
    print(number)
```

Output:

```text
1
2
4
5
```

The value 3 is skipped.

---

## Use Them Carefully

`break` and `continue` are useful, but too many of them can make code harder to read. Use them when they make the logic clearer.

---

## Summary

Use `break` to stop a loop and `continue` to skip one iteration.
