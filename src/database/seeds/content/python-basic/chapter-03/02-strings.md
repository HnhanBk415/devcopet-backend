# Strings

A **string** is a piece of text. In Python, strings are written inside quotation marks.

You can use either double quotes or single quotes:

```python
name = "Python"
message = 'Hello, World!'
```

Both are valid.

---

## Printing Strings

You can print a string directly:

```python
print("Welcome to Python")
```

Output:

```text
Welcome to Python
```

You can also store a string in a variable:

```python
course = "Python Basic"
print(course)
```

---

## Joining Strings

You can join strings using the `+` operator. This is called **string concatenation**.

```python
first_name = "Alex"
last_name = "Kim"

print(first_name + " " + last_name)
```

Output:

```text
Alex Kim
```

The string `" "` adds a space between the two names.

---

## Strings Can Contain Numbers

A string can contain number characters, but that does not make it a number.

```python
age = "18"
print(age)
```

This looks like a number, but Python treats it as text because it is inside quotes.

---

## Common String Mistake

Incorrect:

```python
print(Hello)
```

Python thinks `Hello` is a variable name. If you want text, use quotes.

Correct:

```python
print("Hello")
```

---

## Quick Practice

Create three string variables:

```python
city = "Da Nang"
language = "Python"
goal = "build apps"

print(city)
print(language)
print(goal)
```

---

## Summary

Strings are used to store text. They must be written inside quotation marks and can be printed, stored in variables, and joined together.
