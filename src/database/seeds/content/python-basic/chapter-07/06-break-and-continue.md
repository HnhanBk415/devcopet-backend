# break and continue

Sometimes you need more control inside a loop. `break` stops the loop early, while `continue` skips the rest of the current iteration and moves to the next one.

---

## Learning Goals

By the end of this lesson, you should be able to:

- `break` exits the loop.
- `continue` skips to the next iteration.
- Use them to make loop control clearer, not more confusing.

---

## 1. break stops the loop

Use `break` when you have found what you need or want to exit early.

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

---

## 2. continue skips one iteration

Use `continue` to skip certain values but keep looping.

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

---

## 3. Use carefully

Too many `break` or `continue` statements can make code harder to read. Use them when they make the logic clearer.

```python
for word in ["yes", "skip", "done"]:
    if word == "skip":
        continue
    print(word)
```

Output:

```text
yes
done
```

---

## Mini Practice

1. Write a loop that stops when number equals 4.
2. Write a loop that skips number 2.
3. Explain the difference between break and continue.

---

## Summary

- `break` exits the loop.
- `continue` skips to the next iteration.
- Use them to make loop control clearer, not more confusing.

Next, you will review common loop mistakes.
