# Common Loop Mistakes

Loop mistakes can create infinite loops, skipped values, or wrong output. Learning the common patterns makes debugging much easier.

---

## Learning Goals

By the end of this lesson, you should be able to:

- Update while-loop variables to avoid infinite loops.
- Remember that range stop values are excluded.
- Indentation controls what belongs inside the loop.

---

## 1. Forgetting to update while variables

A while loop needs progress toward its stopping condition.

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

## 2. Off-by-one errors

`range()` stops before the stop value, so `range(1, 5)` prints 1 through 4.

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

---

## 3. Wrong indentation

Indented code is inside the loop. Unindented code runs after the loop finishes.

```python
for i in range(3):
    print(i)
print("Done")
```

Output:

```text
0
1
2
Done
```

---

## Mini Practice

1. Fix a while loop that never updates its counter.
2. Predict the output of `range(1, 4)`.
3. Move a print statement inside and outside a loop to compare behavior.

---

## Summary

- Update while-loop variables to avoid infinite loops.
- Remember that range stop values are excluded.
- Indentation controls what belongs inside the loop.

You have completed the loops chapter and are ready to practice with more complex programs.
