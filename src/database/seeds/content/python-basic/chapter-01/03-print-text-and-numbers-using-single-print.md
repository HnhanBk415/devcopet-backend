# Print Text and Numbers Using a Single `print()`

## Lesson Overview

Python can print more than one value in a single `print()` statement.

This is useful when you want to display text together with numbers.

```python
print("My age is", 18)
```

Output:

```text
My age is 18
```

In this lesson, you will learn how to combine text, numbers, and calculation results using commas.

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Print text and numbers in one `print()` statement.
- Use commas to separate values.
- Print labels with values.
- Print calculation results with text.
- Avoid common mistakes when mixing text and numbers.

---

## 1. Printing Text and Numbers Together

Use commas to separate values inside `print()`.

```python
print("I am", 18, "years old.")
```

Output:

```text
I am 18 years old.
```

Python prints each value from left to right and automatically adds spaces between comma-separated values.

---

## 2. Basic Syntax

The general structure is:

```python
print(value1, value2, value3)
```

Example:

```python
print("Score:", 95)
```

Output:

```text
Score: 95
```

Here:

- `"Score:"` is text.
- `95` is a number.
- The comma separates them.

---

## 3. Printing Labels and Values

A common output pattern is:

```python
print("Label:", value)
```

Examples:

```python
print("Name:", "Alex")
print("Age:", 18)
print("Height:", 1.75)
print("Score:", 95)
```

Output:

```text
Name: Alex
Age: 18
Height: 1.75
Score: 95
```

This makes your output easier to understand.

---

## 4. Printing Calculation Results with Text

You can print text and a calculation result together.

```python
print("The sum is", 10 + 5)
```

Output:

```text
The sum is 15
```

Python first calculates `10 + 5`, then prints the result.

---

## 5. Text in Quotes vs Numbers Without Quotes

Text must be written inside quotation marks. Numbers do not need quotation marks.

```python
print("Next year:", 18 + 1)
```

Output:

```text
Next year: 19
```

But:

```python
print("Next year:", "18 + 1")
```

Output:

```text
Next year: 18 + 1
```

Python does not calculate expressions inside quotes.

---

## 6. Commas Automatically Add Spaces

When you use commas, Python adds spaces automatically.

```python
print("Hello", "Python")
```

Output:

```text
Hello Python
```

This is why:

```python
print("Age:", 18)
```

prints:

```text
Age: 18
```

not:

```text
Age:18
```

---

## Common Mistakes

### Mistake 1: Forgetting the comma

Incorrect:

```python
print("Age:" 18)
```

Correct:

```python
print("Age:", 18)
```

### Mistake 2: Putting calculations inside quotes

Incorrect if you want Python to calculate:

```python
print("Total:", "10 + 5")
```

Output:

```text
Total: 10 + 5
```

Correct:

```python
print("Total:", 10 + 5)
```

Output:

```text
Total: 15
```

### Mistake 3: Using `+` between text and numbers

Incorrect:

```python
print("Age: " + 18)
```

Beginner-friendly solution:

```python
print("Age:", 18)
```

---

## Mini Exercises

### Exercise 1

Write a program that prints:

```text
Age: 18
```

Solution:

```python
print("Age:", 18)
```

### Exercise 2

Write a program that prints the result of `12 + 8` with a label.

Expected output:

```text
Sum: 20
```

Solution:

```python
print("Sum:", 12 + 8)
```

### Exercise 3

What is the output?

```python
print("Total:", "5 + 5")
```

Answer:

```text
Total: 5 + 5
```

Because `"5 + 5"` is inside quotes, Python prints it as text.

---

## Key Takeaways

- Use commas to print multiple values in one `print()` statement.
- Text must be inside quotation marks.
- Numbers and calculations do not need quotation marks.
- Python adds spaces between comma-separated values.
- For beginners, commas are safer than `+` when printing text with numbers.

---

## Next Lesson

Next, you will learn more about printing calculations.
