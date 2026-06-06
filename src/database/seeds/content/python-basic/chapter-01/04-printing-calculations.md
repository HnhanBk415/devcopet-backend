# Printing Calculations

## Lesson Overview

Python can calculate values and print the result immediately.

```python
print(4 + 6)
```

Output:

```text
10
```

This lesson focuses on using `print()` with arithmetic expressions.

You will learn how Python evaluates calculations before displaying the output.

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Print results of arithmetic expressions.
- Use basic arithmetic operators.
- Understand the difference between printing a calculation and printing text.
- Combine text labels with calculation results.

---

## 1. Printing a Calculation Result

You can place a calculation directly inside `print()`.

```python
print(2 + 3)
```

Output:

```text
5
```

Python first evaluates the expression `2 + 3`, then displays the result.

---

## 2. Basic Arithmetic Operators

Python supports common arithmetic operators.

```python
print(10 + 5)   # addition
print(10 - 5)   # subtraction
print(10 * 5)   # multiplication
print(10 / 5)   # division
```

Output:

```text
15
5
50
2.0
```

Notice that division `/` produces `2.0`, not `2`. Division returns a float.

---

## 3. Printing Calculations with Labels

A calculation result is easier to understand when printed with a label.

```python
print("Sum:", 10 + 5)
print("Difference:", 10 - 5)
print("Product:", 10 * 5)
print("Quotient:", 10 / 5)
```

Output:

```text
Sum: 15
Difference: 5
Product: 50
Quotient: 2.0
```

---

## 4. Calculations Inside Quotes Are Not Calculated

If a calculation is inside quotation marks, Python treats it as text.

```python
print("10 + 5")
```

Output:

```text
10 + 5
```

Compare:

```python
print(10 + 5)
```

Output:

```text
15
```

---

## 5. Showing the Expression and the Result

Sometimes you may want to show both the expression and the result.

```python
print("10 + 5 =", 10 + 5)
```

Output:

```text
10 + 5 = 15
```

Another example:

```python
print("6 * 7 =", 6 * 7)
```

Output:

```text
6 * 7 = 42
```

---

## 6. Order of Operations

Python follows normal mathematical order.

```python
print(2 + 3 * 4)
```

Output:

```text
14
```

Python calculates multiplication first.

Use parentheses to control the order:

```python
print((2 + 3) * 4)
```

Output:

```text
20
```

---

## Common Mistakes

### Mistake 1: Putting expressions inside quotes

```python
print("8 * 3")
```

Output:

```text
8 * 3
```

Correct:

```python
print(8 * 3)
```

Output:

```text
24
```

### Mistake 2: Expecting `/` to return an integer

```python
print(10 / 5)
```

Output:

```text
2.0
```

This is normal. Division returns a float.

### Mistake 3: Forgetting parentheses for order

```python
print(2 + 3 * 4)
```

Output:

```text
14
```

If you want addition first:

```python
print((2 + 3) * 4)
```

Output:

```text
20
```

---

## Mini Exercises

### Exercise 1

Print the result of:

```text
15 + 20
```

Solution:

```python
print(15 + 20)
```

### Exercise 2

Print this output:

```text
Total: 35
```

Solution:

```python
print("Total:", 15 + 20)
```

### Exercise 3

What is the output?

```python
print("4 * 5")
```

Answer:

```text
4 * 5
```

The expression is inside quotes, so Python prints it as text.

### Exercise 4

What is the output?

```python
print(4 * 5)
```

Answer:

```text
20
```

Python calculates the expression before printing it.

---

## Key Takeaways

- Python can print calculation results directly.
- `+`, `-`, `*`, and `/` are common arithmetic operators.
- Calculations inside quotes are printed as text.
- Use commas to print labels with calculation results.
- Parentheses can control calculation order.

---

## Next Lesson

Next, you will review common mistakes when using `print()`.
