# The while Loop

A `while` loop repeats code while a condition is true.

---

## Basic Syntax

```python
while condition:
    code_to_repeat
```

The loop continues until the condition becomes false.

---

## Example

```python
count = 1

while count <= 3:
    print(count)
    count += 1
```

Output:

```text
1
2
3
```

---

## How It Works

1. Python checks `count <= 3`.
2. If true, it runs the indented code.
3. `count` increases by 1.
4. Python checks the condition again.
5. The loop stops when the condition is false.

---

## Summary

Use a `while` loop when you want to repeat code as long as a condition remains true.
