# Print Text and Numbers Using a Single `print()`

## Lesson Overview

In the previous lessons, you learned how to display output and print on multiple lines.

In this lesson, you will learn how to print **text and numbers together** using a single `print()` statement.

Example:

```python
print("My age is", 18)
```

Output:

```text
My age is 18
```

This is useful when you want to display a message together with a number, calculation, or value.

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Print text and numbers in one `print()` statement.
- Use commas to separate multiple values in `print()`.
- Print text with calculation results.
- Understand why numbers and text behave differently.
- Avoid common mistakes when mixing text and numbers.

---

## 1. Printing Text and Numbers Together

You can print text and numbers together by separating them with commas.

Example:

```python
print("I am", 18, "years old.")
```

Output:

```text
I am 18 years old.
```

Python prints each value from left to right.

The values are:

```text
"I am"
18
"years old."
```

Python automatically adds spaces between values separated by commas.

---

## 2. Basic Syntax

The basic syntax is:

```python
print(value1, value2, value3)
```

Each value is separated by a comma.

Example:

```python
print("Score:", 95)
```

Output:

```text
Score: 95
```

The text `"Score:"` is a string.

The number `95` is an integer.

Python can print both in the same `print()` statement.

---

## 3. Why Use Commas?

Commas allow `print()` to display different types of values together.

Example:

```python
print("Apples:", 5)
print("Price:", 2.5)
print("Total:", 5 * 2.5)
```

Output:

```text
Apples: 5
Price: 2.5
Total: 12.5
```

This is clear and easy to read.

---

## 4. Printing a Calculation with Text

You can place a calculation inside `print()`.

Example:

```python
print("The sum is", 10 + 5)
```

Output:

```text
The sum is 15
```

Python first calculates:

```text
10 + 5 = 15
```

Then it prints:

```text
The sum is 15
```

Another example:

```python
print("The product is", 6 * 7)
```

Output:

```text
The product is 42
```

---

## 5. Text Inside Quotes vs Numbers Without Quotes

Text must be written inside quotation marks.

Numbers do not need quotation marks.

Example:

```python
print("Age:", 18)
```

Output:

```text
Age: 18
```

Here:

- `"Age:"` is text.
- `18` is a number.

If you write:

```python
print("Age:", "18")
```

Output:

```text
Age: 18
```

The output looks the same, but `"18"` is text, not a number.

This matters when doing calculations.

Example:

```python
print("Next year:", 18 + 1)
```

Output:

```text
Next year: 19
```

But this is different:

```python
print("Next year:", "18 + 1")
```

Output:

```text
Next year: 18 + 1
```

Because `"18 + 1"` is inside quotation marks, Python prints it as text.

---

## 6. Printing Multiple Numbers

You can print more than one number in a single `print()` statement.

Example:

```python
print("Numbers:", 1, 2, 3, 4, 5)
```

Output:

```text
Numbers: 1 2 3 4 5
```

Python automatically separates the values with spaces.

Another example:

```python
print("Coordinates:", 10, 20)
```

Output:

```text
Coordinates: 10 20
```

---

## 7. Printing Labels and Values

A common pattern is:

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

This format is useful because the output is easy to understand.

---

## 8. Commas Automatically Add Spaces

When you use commas inside `print()`, Python adds spaces automatically.

Example:

```python
print("Hello", "Python")
```

Output:

```text
Hello Python
```

Another example:

```python
print("A", "B", "C")
```

Output:

```text
A B C
```

This is why:

```python
print("Age:", 18)
```

prints:

```text
Age: 18
```

instead of:

```text
Age:18
```

---

## 9. Common Mistakes

### Mistake 1: Forgetting the comma

Incorrect:

```python
print("Age:" 18)
```

This causes an error because Python does not know how to combine the string and the number.

Correct:

```python
print("Age:", 18)
```

Output:

```text
Age: 18
```

---

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

Anything inside quotation marks is treated as text.

---

### Mistake 3: Forgetting quotation marks around text

Incorrect:

```python
print(Age:, 18)
```

Correct:

```python
print("Age:", 18)
```

Text must be inside quotation marks.

---

### Mistake 4: Using `+` between text and numbers

Incorrect:

```python
print("Age: " + 18)
```

This causes an error because Python cannot directly add a string and an integer.

Correct:

```python
print("Age:", 18)
```

Using commas is easier for beginners because Python handles different value types automatically.

---

## 10. Practice Examples

Try to predict the output before running each program.

### Example 1

```python
print("Age:", 20)
```

Output:

```text
Age: 20
```

---

### Example 2

```python
print("Result:", 8 + 2)
```

Output:

```text
Result: 10
```

---

### Example 3

```python
print("8 + 2 =", 8 + 2)
```

Output:

```text
8 + 2 = 10
```

---

### Example 4

```python
print("Items:", 3, "Price:", 10)
```

Output:

```text
Items: 3 Price: 10
```

---

## 11. Mini Exercises

### Exercise 1

Write a program that prints:

```text
Age: 18
```

Solution:

```python
print("Age:", 18)
```

---

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

---

### Exercise 3

Write a program that prints:

```text
My score is 95
```

Solution:

```python
print("My score is", 95)
```

---

### Exercise 4

What is the output of this code?

```python
print("Total:", "5 + 5")
```

Answer:

```text
Total: 5 + 5
```

Explanation:

`"5 + 5"` is inside quotation marks, so Python treats it as text instead of calculating it.

---

### Exercise 5

What is the output of this code?

```python
print("Total:", 5 + 5)
```

Answer:

```text
Total: 10
```

Explanation:

`5 + 5` is not inside quotation marks, so Python calculates it first.

---

## Key Takeaways

- You can print text and numbers together using commas.
- Text must be written inside quotation marks.
- Numbers and calculations do not need quotation marks.
- Python automatically adds spaces between values separated by commas.
- Use commas instead of `+` when printing text and numbers together as a beginner.

---

## Next Lesson

In the next lesson, you will continue learning how to control and format output in Python.
