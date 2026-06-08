# What Is a Data Type?

A **data type** tells Python what kind of value it is working with.

Different values behave in different ways. Text, numbers, decimal values, and true/false values are not the same thing, so Python gives each of them a type.

---

## Why Data Types Matter

Imagine these two values:

```python
print(10 + 5)
print("10" + "5")
```

The first line prints:

```text
15
```

The second line prints:

```text
105
```

Why?

Because `10` and `5` are numbers, but `"10"` and `"5"` are strings. Python treats them differently.

---

## Common Python Data Types

In this chapter, you will learn these basic types:

| Type | Meaning | Example |
|---|---|---|
| `str` | Text | `"Python"` |
| `int` | Whole number | `25` |
| `float` | Decimal number | `3.14` |
| `bool` | True or false value | `True` |

---

## Data Types Help Python Make Decisions

Python uses data types to decide what operations are allowed.

For example:

```python
age = 18
name = "Alex"

print(age + 2)
print(name + " is learning Python")
```

The variable `age` can be used in math. The variable `name` can be joined with other text.

---

## Quick Practice

Look at the values below and guess their data types:

```python
"Hello"
100
12.5
True
```

Expected answers:

```text
str
int
float
bool
```

---

## Summary

A data type describes what kind of value something is. Understanding data types helps you write programs that work correctly and avoid common errors.
