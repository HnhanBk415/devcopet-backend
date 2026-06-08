# Avoiding Infinite Loops

An infinite loop happens when the loop condition never becomes false. Sometimes infinite loops are intentional, but beginners usually create them by mistake.

---

## Learning Goals

By the end of this lesson, you should be able to:

- Infinite loops happen when a condition never becomes false.
- Update loop variables correctly.
- Know your stopping condition before writing the loop.

---

## 1. The common mistake

If you forget to update the variable, the condition may stay true forever.

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

## 2. Check the stopping condition

Before writing a loop, identify what should make it stop.

```python
password = ""
while password != "python":
    password = input("Password: ")
print("Access granted")
```

Output:

```text
Password: python
Access granted
```

---

## 3. Use Ctrl+C when stuck

If a terminal program is stuck in an infinite loop, you can usually stop it with Ctrl+C.

```python
# while True:
#     print("This would run forever")
print("Safe example")
```

Output:

```text
Safe example
```

---

## Mini Practice

1. Explain why `while x > 0` needs an update to x.
2. Write a countdown loop that stops.
3. Identify the stopping condition before coding a loop.

---

## Summary

- Infinite loops happen when a condition never becomes false.
- Update loop variables correctly.
- Know your stopping condition before writing the loop.

Next, you will learn the `for` loop.
