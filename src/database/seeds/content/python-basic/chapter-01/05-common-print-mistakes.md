# Common Print Mistakes

## Lesson Overview

The `print()` function is simple, but beginners often make small syntax mistakes.

These mistakes are normal when learning Python.

In this lesson, you will review common `print()` mistakes and learn how to fix them.

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Identify common `print()` syntax errors.
- Fix missing parentheses.
- Fix missing or mismatched quotation marks.
- Fix mistakes when printing text with numbers.
- Understand why some outputs are different from expected.

---

## 1. Missing Parentheses

In Python 3, `print()` must use parentheses.

Incorrect:

```python
print "Hello"
```

Correct:

```python
print("Hello")
```

Output:

```text
Hello
```

The parentheses tell Python what value should be printed.

---

## 2. Missing Quotation Marks Around Text

Text must be inside quotation marks.

Incorrect:

```python
print(Hello)
```

Python thinks `Hello` is a variable name.

Correct:

```python
print("Hello")
```

Output:

```text
Hello
```

---

## 3. Mismatched Quotation Marks

The opening and closing quotation marks must match.

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

Both single quotes and double quotes are valid, but they must match.

---

## 4. Forgetting a Comma Between Values

When printing multiple values, separate them with commas.

Incorrect:

```python
print("Age:" 18)
```

Correct:

```python
print("Age:", 18)
```

Output:

```text
Age: 18
```

The comma tells Python that `"Age:"` and `18` are two separate values.

---

## 5. Confusing Text and Calculations

Anything inside quotes is treated as text.

```python
print("2 + 3")
```

Output:

```text
2 + 3
```

If you want Python to calculate the result, remove the quotes:

```python
print(2 + 3)
```

Output:

```text
5
```

---

## 6. Using `+` with Text and Numbers

Beginners sometimes try this:

```python
print("Age: " + 18)
```

This causes an error because Python cannot directly add a string and an integer.

Better:

```python
print("Age:", 18)
```

Output:

```text
Age: 18
```

Using commas is easier when printing mixed types.

---

## 7. Writing `/n` Instead of `\n`

If you want a new line inside a string, use `\n`.

Incorrect:

```python
print("Hello/nPython")
```

Output:

```text
Hello/nPython
```

Correct:

```python
print("Hello\nPython")
```

Output:

```text
Hello
Python
```

The backslash matters.

---

## Quick Fix Checklist

When `print()` does not work, check:

```text
1. Did I use parentheses?
2. Did I put text inside quotes?
3. Do my quotes match?
4. Did I separate values with commas?
5. Did I accidentally put a calculation inside quotes?
6. Did I write \n correctly?
```

---

## Mini Exercises

### Exercise 1

Fix this code:

```python
print "Hello"
```

Solution:

```python
print("Hello")
```

### Exercise 2

Fix this code:

```python
print(Welcome)
```

Solution:

```python
print("Welcome")
```

### Exercise 3

Fix this code:

```python
print("Age:" 20)
```

Solution:

```python
print("Age:", 20)
```

### Exercise 4

What is the output?

```python
print("3 + 4")
```

Answer:

```text
3 + 4
```

Because the expression is inside quotes.

### Exercise 5

What is the output?

```python
print(3 + 4)
```

Answer:

```text
7
```

Because Python calculates it before printing.

---

## Key Takeaways

- `print()` needs parentheses in Python 3.
- Text needs quotation marks.
- Quotes must match.
- Use commas to print text and numbers together.
- Calculations inside quotes are not calculated.
- Most beginner errors are caused by small punctuation mistakes.

---

## Chapter Summary

In this chapter, you learned how to:

- Display output with `print()`.
- Print text, numbers, and calculations.
- Print on multiple lines.
- Print text and numbers together.
- Recognize and fix common `print()` mistakes.

You are now ready to learn variables.
