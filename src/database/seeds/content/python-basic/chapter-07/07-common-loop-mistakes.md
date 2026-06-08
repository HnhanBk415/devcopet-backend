# Common Loop Mistakes

Loops are useful, but they can create confusing bugs. Here are common mistakes to avoid.

---

## Mistake 1: Infinite while Loop

Incorrect:

```python
count = 1

while count <= 5:
    print(count)
```

Correct:

```python
count = 1

while count <= 5:
    print(count)
    count += 1
```

---

## Mistake 2: Forgetting Indentation

Incorrect:

```python
for i in range(3):
print(i)
```

Correct:

```python
for i in range(3):
    print(i)
```

---

## Mistake 3: Expecting range() to Include the Stop Value

```python
for i in range(1, 5):
    print(i)
```

Output:

```text
1
2
3
4
```

The number 5 is not included.

---

## Mistake 4: Changing the Wrong Variable

Make sure the variable in the loop condition is the one being updated.

---

## Summary

When debugging loops, check the condition, indentation, update step, and range boundaries.
