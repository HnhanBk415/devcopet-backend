# Introducing User Input

So far, your programs may have displayed information using `print()`. But real programs often need information from the user.

This information is called **user input**.

---

## Why User Input Matters

User input allows a program to become interactive.

For example, a program can ask:

- What is your name?
- How old are you?
- What number do you want to calculate?
- Which option do you choose?

Without input, the program always does the same thing. With input, the program can respond to the user.

---

## Example Interaction

A program might ask:

```text
What is your name?
```

The user types:

```text
Alex
```

Then the program responds:

```text
Hello, Alex!
```

---

## Python Uses input()

Python provides the `input()` function to collect input from the keyboard.

```python
name = input("What is your name? ")
print("Hello, " + name)
```

The text inside `input()` is the question shown to the user.

---

## Summary

User input lets your program communicate with the person using it. In Python, you will use `input()` to collect that information.
