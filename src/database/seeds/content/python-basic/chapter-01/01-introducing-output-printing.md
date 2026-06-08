# Introducing Output / Printing

## Lesson Overview

In programming, **output** means showing information from a program to the user.

In Python, the most common way to display output is by using the `print()` function.

```python
print("Hello, World!")
```

Output:

```text
Hello, World!
```

This lesson introduces the basic idea of output and how Python displays text, numbers, and simple results.

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Explain what output means in programming.
- Use `print()` to display text.
- Print numbers and simple calculations.
- Avoid basic `print()` syntax mistakes.

---

## 1. What Is Output?

A program often needs to show information to the user.

For example, a program may show:

- A welcome message
- A calculation result
- A warning message
- A value stored in the program

This displayed information is called **output**.

Example:

```python
print("Welcome to Python!")
```

Output:

```text
Welcome to Python!
```

---

## 2. The `print()` Function

Python uses the built-in `print()` function to display output.

Basic syntax:

```python
print(value)
```

The value inside the parentheses is displayed on the screen.

Example:

```python
print("I am learning Python.")
```

Output:

```text
I am learning Python.
```

---

## 3. Printing Text

Text in Python is written inside quotation marks.

```python
print("Python is fun!")
print('Python is powerful!')
```

Output:

```text
Python is fun!
Python is powerful!
```

Single quotes and double quotes are both valid. Just make sure the opening and closing quotes match.

Incorrect:

```python
print("Hello')
```

Correct:

```python
print("Hello")
```

---

## 4. Printing Numbers

Numbers do not need quotation marks.

```python
print(100)
print(3.14)
```

Output:

```text
100
3.14
```

If you put a number inside quotes, Python treats it as text.

```python
print("100")
```

Output:

```text
100
```

The output looks the same, but `"100"` is text, while `100` is a number.

---

## 5. Printing Simple Calculations

You can print the result of a calculation.

```python
print(2 + 3)
print(10 - 4)
print(5 * 6)
print(20 / 4)
```

Output:

```text
5
6
30
5.0
```

Python calculates the expression first, then prints the result.

---

## Common Mistakes

### Mistake 1: Forgetting quotes around text

Incorrect:

```python
print(Hello)
```

Correct:

```python
print("Hello")
```

Without quotes, Python thinks `Hello` is a variable name.

### Mistake 2: Forgetting parentheses

Incorrect:

```python
print "Hello"
```

Correct:

```python
print("Hello")
```

In Python 3, `print` must use parentheses.

### Mistake 3: Putting calculations inside quotes

```python
print("2 + 3")
```

Output:

```text
2 + 3
```

To calculate it, write:

```python
print(2 + 3)
```

Output:

```text
5
```

---

## Mini Exercises

### Exercise 1

Write a program that prints:

```text
Hello, World!
```

Solution:

```python
print("Hello, World!")
```

### Exercise 2

Write a program that prints your name.

Example:

```python
print("My name is Alex.")
```

### Exercise 3

What is the output?

```python
print("8 + 12")
```

Answer:

```text
8 + 12
```

Because the expression is inside quotes, Python treats it as text.

---

## Key Takeaways

- Output means displaying information from a program.
- Python uses `print()` to display output.
- Text needs quotation marks.
- Numbers and calculations do not need quotation marks.
- Anything inside quotes is printed as text.

---

## Next Lesson

Next, you will learn how to print output on multiple lines.
