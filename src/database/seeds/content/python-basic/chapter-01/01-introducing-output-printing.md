# Introducing Output / Printing

## Lesson Overview

In programming, **output** means showing information from a program to the user.

In Python, the most common way to display output is by using the `print()` function.

```python
print("Hello, World!")
```

When this program runs, Python displays:

```text
Hello, World!
```

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Understand what output means in programming.
- Use the `print()` function to display text.
- Print numbers and simple values.
- Recognize common mistakes when using `print()`.

---

## 1. What Is Output?

A program often needs to communicate with the user.

For example, a program may need to show:

- A welcome message
- A result of a calculation
- A warning message
- The current value of a variable
- Instructions for the next step

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

The basic syntax is:

```python
print(value)
```

The value inside the parentheses is what Python will display.

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

Text in Python is usually written inside quotation marks.

You can use double quotes:

```python
print("Python is fun!")
```

Output:

```text
Python is fun!
```

You can also use single quotes:

```python
print('Python is powerful!')
```

Output:

```text
Python is powerful!
```

Both are valid. The important point is that the opening and closing quotation marks must match.

Correct:

```python
print("Hello")
print('Hello')
```

Incorrect:

```python
print("Hello')
```

The incorrect example will cause an error because the quotes do not match.

---

## 4. Printing Numbers

Numbers do not need quotation marks.

Example:

```python
print(100)
print(3.14)
```

Output:

```text
100
3.14
```

If you put a number inside quotation marks, Python treats it as text.

Example:

```python
print("100")
```

Output:

```text
100
```

The output looks the same, but internally Python treats `"100"` as text, not as a number.

---

## 5. Printing Calculations

You can also print the result of a calculation.

Example:

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

Python evaluates the expression first, then prints the result.

Example:

```python
print(10 + 5)
```

Python first calculates:

```text
10 + 5 = 15
```

Then it displays:

```text
15
```

---

## 6. Printing Multiple Values

The `print()` function can display more than one value at the same time.

Use commas to separate the values.

Example:

```python
print("My age is", 18)
```

Output:

```text
My age is 18
```

Python automatically adds a space between values separated by commas.

Another example:

```python
print("The answer is", 2 + 3)
```

Output:

```text
The answer is 5
```

---

## 7. Empty `print()`

You can call `print()` with nothing inside the parentheses.

Example:

```python
print("Line above")
print()
print("Line below")
```

Output:

```text
Line above

Line below
```

An empty `print()` creates a blank line.

---

## 8. Common Mistakes

### Mistake 1: Forgetting quotation marks for text

Incorrect:

```python
print(Hello)
```

This causes an error because Python thinks `Hello` is a variable name.

Correct:

```python
print("Hello")
```

---

### Mistake 2: Forgetting parentheses

Incorrect:

```python
print "Hello"
```

Correct:

```python
print("Hello")
```

In Python 3, `print` must be used with parentheses.

---

### Mistake 3: Mismatched quotation marks

Incorrect:

```python
print("Hello')
```

Correct:

```python
print("Hello")
```

or:

```python
print('Hello')
```

---

### Mistake 4: Using commas incorrectly

Incorrect:

```python
print("Age is" 18)
```

Correct:

```python
print("Age is", 18)
```

Use a comma to separate multiple values.

---

## 9. Practice Examples

Try to predict the output before running each program.

### Example 1

```python
print("Hello, Python!")
```

Output:

```text
Hello, Python!
```

---

### Example 2

```python
print(7 + 3)
```

Output:

```text
10
```

---

### Example 3

```python
print("7 + 3")
```

Output:

```text
7 + 3
```

Explanation:

Because `7 + 3` is inside quotation marks, Python prints it as text instead of calculating it.

---

### Example 4

```python
print("Result:", 7 + 3)
```

Output:

```text
Result: 10
```

Explanation:

Python prints the text `"Result:"`, then prints the calculated value of `7 + 3`.

---

## 10. Mini Exercises

### Exercise 1

Write a program that prints:

```text
Hello, World!
```

Starter code:

```python
print("Hello, World!")
```

---

### Exercise 2

Write a program that prints your name.

Example:

```python
print("My name is Alex.")
```

---

### Exercise 3

Write a program that prints the result of:

```text
8 + 12
```

Expected output:

```text
20
```

Solution:

```python
print(8 + 12)
```

---

### Exercise 4

What is the output of this code?

```python
print("8 + 12")
```

Answer:

```text
8 + 12
```

Explanation:

The expression is inside quotation marks, so Python treats it as text.

---

## Key Takeaways

- Output means displaying information from a program.
- Python uses `print()` to show output.
- Text must be written inside quotation marks.
- Numbers and calculations do not need quotation marks.
- Commas can be used to print multiple values.
- `print()` with nothing inside creates a blank line.

---

## Next Lesson

In the next lesson, you will learn how to print output on multiple lines.
