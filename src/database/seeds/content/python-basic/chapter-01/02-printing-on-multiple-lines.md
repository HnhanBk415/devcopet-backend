# Printing on Multiple Lines

## Lesson Overview

In the previous lesson, you learned how to display output using `print()`.

In this lesson, you will learn how to print output on **multiple lines**.

Python provides several simple ways to do this:

- Use multiple `print()` statements.
- Use the newline character `\n`.
- Use an empty `print()` for a blank line.
- Use triple-quoted strings for longer multi-line text.

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Print separate lines using multiple `print()` statements.
- Use `\n` to create line breaks.
- Use empty `print()` statements to create blank lines.
- Use triple-quoted strings for multi-line text.

---

## 1. Using Multiple `print()` Statements

The simplest way to print multiple lines is to use more than one `print()` statement.

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

Each `print()` statement moves to a new line by default.

---

## 2. Printing a Blank Line

You can call `print()` with nothing inside the parentheses.

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

The empty `print()` creates one blank line.

---

## 3. Using `\n`

The symbol `\n` is called a **newline character**.

It creates a line break inside a string.

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

## 4. Using Multiple `\n` Characters

You can use more than one newline character.

```python
print("A\nB\nC")
```

Output:

```text
A
B
C
```

You can also create blank lines:

```python
print("Line 1\n\nLine 3")
```

Output:

```text
Line 1

Line 3
```

The `\n\n` creates an empty line between the two lines.

---

## 5. Triple-Quoted Strings

Python allows strings to span multiple lines using triple quotes.

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

Triple-quoted strings are useful when you want to write longer text exactly as it should appear.

---

## Common Mistakes

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

### Mistake 2: Putting `\n` outside a string

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

The `\n` character must be inside a string.

---

## Mini Exercises

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

### Exercise 2

Write the same output using `\n`.

Solution:

```python
print("Hello\nWorld")
```

### Exercise 3

What is the output?

```python
print("A\n\nB")
```

Answer:

```text
A

B
```

The first `\n` moves to the next line. The second `\n` creates an extra blank line.

---

## Key Takeaways

- Each `print()` starts a new line by default.
- Empty `print()` creates a blank line.
- `\n` creates a line break inside a string.
- Triple-quoted strings can display multi-line text.
- The newline character is `\n`, not `/n`.

---

## Next Lesson

Next, you will learn how to print text and numbers in a single `print()` statement.
