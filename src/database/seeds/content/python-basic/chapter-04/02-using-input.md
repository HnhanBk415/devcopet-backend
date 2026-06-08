# Using input()

The `input()` function is simple, but writing good input statements is important. You usually store the result in a variable so you can use it later.

---

## Learning Goals

By the end of this lesson, you should be able to:

- `input()` can include a prompt string.
- Store input in a variable if you need it later.
- Clear variable names make interactive programs easier to read.

---

## 1. Basic syntax

Write `input()` with a prompt string inside parentheses. Store the returned value in a variable.

```python
username = input("Username: ")
print("Welcome, " + username)
```

Output:

```text
Username: coder
Welcome, coder
```

---

## 2. Input returns what the user typed

Whatever the user types before pressing Enter becomes the returned value.

```python
word = input("Type one word: ")
print(word)
```

Output:

```text
Type one word: python
python
```

---

## 3. Use meaningful variable names

Names like `name`, `choice`, or `age_text` make code easier to understand than names like `x`.

```python
favorite_language = input("Favorite language: ")
print(favorite_language)
```

Output:

```text
Favorite language: Python
Python
```

---

## Mini Practice

1. Ask the user for a username.
2. Store the answer in a descriptive variable.
3. Print a welcome message using that variable.

---

## Summary

- `input()` can include a prompt string.
- Store input in a variable if you need it later.
- Clear variable names make interactive programs easier to read.

Next, you will practice storing input in variables.
