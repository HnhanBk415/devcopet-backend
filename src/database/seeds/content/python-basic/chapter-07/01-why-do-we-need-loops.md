# Why Do We Need Loops?

Loops let your program repeat actions without copying the same line many times. They are essential for lists, games, menus, counting, and repeated user interactions.

---

## Learning Goals

By the end of this lesson, you should be able to:

- Loops reduce repeated code.
- A loop repeats an indented block.
- Loops make programs easier to scale and maintain.

---

## 1. Avoid repetition

Without loops, repeated code becomes long and hard to maintain.

```python
print("Hello")
print("Hello")
print("Hello")
```

Output:

```text
Hello
Hello
Hello
```

---

## 2. A loop repeats code

A loop can run the same block multiple times.

```python
for i in range(3):
    print("Hello")
```

Output:

```text
Hello
Hello
Hello
```

---

## 3. Loops scale better

If you need 100 repetitions, a loop is much cleaner than 100 copied lines.

```python
for number in range(1, 6):
    print(number)
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

## Mini Practice

1. Print your name 3 times with repeated print statements.
2. Rewrite it with a loop.
3. Use a loop to print numbers 1 to 5.

---

## Summary

- Loops reduce repeated code.
- A loop repeats an indented block.
- Loops make programs easier to scale and maintain.

Next, you will learn the `while` loop.
