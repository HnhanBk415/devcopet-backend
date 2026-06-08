# Storing Input in Variables

When you use `input()`, you usually store the result in a variable.

This allows your program to remember and reuse the user's answer.

---

## Example

```python
name = input("Enter your name: ")
print("Welcome, " + name)
```

Here, the user's answer is stored in the variable `name`.

---

## Reusing Input

A variable can be used more than once.

```python
name = input("Enter your name: ")

print("Hello, " + name)
print(name + " is learning Python.")
```

If the user enters `Lina`, the output might be:

```text
Hello, Lina
Lina is learning Python.
```

---

## Multiple Inputs

You can ask for more than one piece of information.

```python
name = input("Name: ")
city = input("City: ")

print(name + " lives in " + city)
```

---

## Naming Input Variables

Choose names that describe the value.

Good:

```python
username = input("Username: ")
age = input("Age: ")
```

Less clear:

```python
x = input("Username: ")
y = input("Age: ")
```

---

## Summary

Storing input in variables helps your program remember user answers and use them later. Choose clear variable names to make your code easier to read.
