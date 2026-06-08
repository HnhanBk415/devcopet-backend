# What Is a Data Type?

Every value in Python has a data type. A data type tells Python what kind of value it is working with, such as text, a whole number, a decimal number, or a true/false value. Understanding data types helps you predict what your code will do.

---

## Learning Goals

By the end of this lesson, you should be able to:

- A data type describes what kind of value Python is using.
- Numbers and strings can look similar but behave differently.
- Knowing data types helps prevent mistakes when writing expressions.

---

## 1. Values have types

Python does not only store a value. It also remembers what kind of value it is. For example, `25` is a number, but `"25"` is text. They look similar to humans, but Python treats them differently.

```python
age = 25
age_text = "25"
print(age)
print(age_text)
```

Output:

```text
25
25
```

---

## 2. Types control behavior

The same symbol can behave differently depending on the types involved. With numbers, `+` performs addition. With strings, `+` joins text together.

```python
print(10 + 5)
print("10" + "5")
```

Output:

```text
15
105
```

---

## 3. Common beginner types

The most common beginner data types are `str` for text, `int` for whole numbers, `float` for decimal numbers, and `bool` for true/false values.

```python
name = "Mina"
age = 18
height = 1.65
is_student = True
print(name, age, height, is_student)
```

Output:

```text
Mina 18 1.65 True
```

---

## Mini Practice

1. Create one variable for your name, age, height, and whether you are a student.
2. Print all four variables.
3. Try adding two numbers, then try joining two strings.

---

## Summary

- A data type describes what kind of value Python is using.
- Numbers and strings can look similar but behave differently.
- Knowing data types helps prevent mistakes when writing expressions.

Next, you will learn about strings, the data type used for text.
