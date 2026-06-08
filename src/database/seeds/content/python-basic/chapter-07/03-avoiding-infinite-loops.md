# Avoiding Infinite Loops

An **infinite loop** is a loop that never stops.

This usually happens when the loop condition never becomes false.

---

## Example of an Infinite Loop

```python
count = 1

while count <= 3:
    print(count)
```

The value of `count` never changes, so the condition stays true forever.

---

## Fix the Loop

```python
count = 1

while count <= 3:
    print(count)
    count += 1
```

Now `count` increases each time, so the loop can stop.

---

## How to Avoid Infinite Loops

Before running a `while` loop, ask:

- What condition starts the loop?
- What changes inside the loop?
- When will the condition become false?

---

## Summary

Infinite loops happen when a loop condition never becomes false. Make sure something inside the loop changes the condition.
