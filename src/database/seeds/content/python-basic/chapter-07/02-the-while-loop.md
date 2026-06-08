# The while Loop

A `while` loop repeats as long as its condition is `True`. It is useful when you do not know in advance how many times the loop should run.

---

## Learning Goals

By the end of this lesson, you should be able to:

- A while loop repeats while a condition is true.
- Update variables so the loop can stop.
- While loops are useful when repetition depends on a condition.

---

## 1. Basic while syntax

Write `while`, a condition, a colon, and an indented block.

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

## 2. Update the loop variable

Most while loops need something inside the loop that eventually makes the condition false.

```python
lives = 3
while lives > 0:
    print("Lives left:", lives)
    lives -= 1
```

Output:

```text
Lives left: 3
Lives left: 2
Lives left: 1
```

---

## 3. User-controlled loops

A while loop can keep asking until the user chooses to stop.

```python
choice = ""
while choice != "q":
    choice = input("Type q to quit: ")
print("Goodbye")
```

Output:

```text
Type q to quit: q
Goodbye
```

---

## Mini Practice

1. Write a while loop that counts from 1 to 5.
2. Write a while loop that counts down from 3.
3. Create a loop that stops when a variable reaches 0.

---

## Summary

- A while loop repeats while a condition is true.
- Update variables so the loop can stop.
- While loops are useful when repetition depends on a condition.

Next, you will learn how to avoid infinite loops.
