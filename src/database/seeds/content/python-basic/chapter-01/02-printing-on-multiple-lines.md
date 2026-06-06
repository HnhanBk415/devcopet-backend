# Printing on Multiple Lines

## Lesson Overview

In the previous lesson, you learned how to display output using the `print()` function.

In this lesson, you will learn how to print output on **multiple lines**.

Python gives you several ways to do this:

- Use multiple `print()` statements.
- Use the newline character `\n`.
- Use triple-quoted strings.
- Use an empty `print()` to create a blank line.

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Print text on separate lines using multiple `print()` statements.
- Use `\n` to create line breaks inside a string.
- Use triple-quoted strings for multi-line text.
- Create blank lines using `print()`.
- Recognize common mistakes when printing multiple lines.

---

## 1. Using Multiple `print()` Statements

The simplest way to print on multiple lines is to use more than one `print()` statement.

Example:

```python
print("Hello")
print("Python")
print("Learner")
```

Output:

```text
Hello
Python
Learner
```

Each `print()` statement displays its output on a new line by default.

---

## 2. Why Does Each `print()` Start a New Line?

By default, `print()` adds a newline after displaying its value.

A **newline** means moving the cursor to the next line.

Example:

```python
print("First line")
print("Second line")
```

Output:

```text
First line
Second line
```

Python prints `"First line"`, then automatically moves to the next line before printing `"Second line"`.

---

## 3. Printing a Blank Line

You can use an empty `print()` statement to create a blank line.

Example:

```python
print("Line 1")
print()
print("Line 2")
```

Output:

```text
Line 1

Line 2
```

The empty `print()` creates one blank line between the two lines of text.

---

## 4. Using `\n` for a New Line

The symbol `\n` is called a **newline character**.

It tells Python to move to the next line.

Example:

```python
print("Hello\nPython")
```

Output:

```text
Hello
Python
```

Even though there is only one `print()` statement, the output appears on two lines.

---

## 5. Using Multiple `\n` Characters

You can use more than one `\n`.

Example:

```python
print("A\nB\nC")
```

Output:

```text
A
B
C
```

Another example:

```python
print("Line 1\n\nLine 3")
```

Output:

```text
Line 1

Line 3
```

The two newline characters `\n\n` create one blank line between the two lines of text.

---

## 6. Printing Multi-line Text with Triple Quotes

Python also supports triple-quoted strings.

Example:

```python
print("""Hello
Python
Learner""")
```

Output:

```text
Hello
Python
Learner
```

Triple-quoted strings are useful when you want to write longer text across multiple lines.

---

## 7. Comparing the Three Main Methods

### Method 1: Multiple `print()` statements

```python
print("Name: Alex")
print("Age: 18")
print("Language: Python")
```

Output:

```text
Name: Alex
Age: 18
Language: Python
```

This method is simple and easy to read.

---

### Method 2: Newline character `\n`

```python
print("Name: Alex\nAge: 18\nLanguage: Python")
```

Output:

```text
Name: Alex
Age: 18
Language: Python
```

This method is useful when you want one string to contain several lines.

---

### Method 3: Triple-quoted string

```python
print("""Name: Alex
Age: 18
Language: Python""")
```

Output:

```text
Name: Alex
Age: 18
Language: Python
```

This method is useful for longer formatted text.

---

## 8. Common Mistakes

### Mistake 1: Writing `/n` instead of `\n`

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

The correct newline character is `\n`, not `/n`.

---

### Mistake 2: Forgetting quotation marks

Incorrect:

```python
print(Hello
Python)
```

Correct:

```python
print("Hello")
print("Python")
```

or:

```python
print("Hello\nPython")
```

Text must be written inside quotation marks.

---

### Mistake 3: Thinking `\n` works outside a string

Incorrect:

```python
print("Hello")\nprint("Python")
```

Correct:

```python
print("Hello")
print("Python")
```

or:

```python
print("Hello\nPython")
```

The newline character `\n` must be inside a string.

---

### Mistake 4: Adding unwanted spaces

Example:

```python
print("Hello \nPython")
```

Output:

```text
Hello 
Python
```

There is a space after `Hello`, so the first output line ends with a space.

Usually, you should write:

```python
print("Hello\nPython")
```

---

## 9. Practice Examples

Try to predict the output before running each program.

### Example 1

```python
print("One")
print("Two")
print("Three")
```

Output:

```text
One
Two
Three
```

---

### Example 2

```python
print("One\nTwo\nThree")
```

Output:

```text
One
Two
Three
```

---

### Example 3

```python
print("One")
print()
print("Three")
```

Output:

```text
One

Three
```

---

### Example 4

```python
print("""Python
is
fun""")
```

Output:

```text
Python
is
fun
```

---

## 10. Mini Exercises

### Exercise 1

Write a program that prints:

```text
Hello
World
```

Solution:

```python
print("Hello")
print("World")
```

---

### Exercise 2

Write the same output using `\n`.

Expected output:

```text
Hello
World
```

Solution:

```python
print("Hello\nWorld")
```

---

### Exercise 3

Write a program that prints:

```text
Name: Alex
Age: 18
Language: Python
```

Possible solution:

```python
print("Name: Alex")
print("Age: 18")
print("Language: Python")
```

Another possible solution:

```python
print("Name: Alex\nAge: 18\nLanguage: Python")
```

---

### Exercise 4

What is the output of this code?

```python
print("A\n\nB")
```

Answer:

```text
A

B
```

Explanation:

The first `\n` moves to the next line. The second `\n` creates an extra blank line.

---

## Key Takeaways

- Each `print()` statement starts a new line by default.
- `print()` with nothing inside creates a blank line.
- `\n` creates a line break inside a string.
- Triple-quoted strings can be used to print multi-line text.
- The newline character is `\n`, not `/n`.

---

## Next Lesson

In the next lesson, you will continue learning basic Python syntax and how programs display information.
