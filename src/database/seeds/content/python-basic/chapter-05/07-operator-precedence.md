# Operator Precedence

Operator precedence determines which parts of an expression Python evaluates first. This helps you write correct calculations.

---

## Learning Goals

By the end of this lesson, you should be able to:

- Python evaluates some operators before others.
- Parentheses are evaluated first.
- Use parentheses to make complex expressions clear.

---

## 1. Multiplication before addition

Python follows math rules: multiplication and division happen before addition and subtraction.

```python
print(2 + 3 * 4)
```

Output:

```text
14
```

---

## 2. Parentheses first

Use parentheses to make the order clear or change the default order.

```python
print((2 + 3) * 4)
```

Output:

```text
20
```

---

## 3. Write readable expressions

Even when precedence works, parentheses can make code easier to read.

```python
subtotal = 100
discount = 20
tax = 0.1
total = (subtotal - discount) * (1 + tax)
print(total)
```

Output:

```text
88.0
```

---

## Mini Practice

1. Predict `5 + 2 * 3`.
2. Use parentheses to make it equal 21.
3. Write a total price expression with parentheses.

---

## Summary

- Python evaluates some operators before others.
- Parentheses are evaluated first.
- Use parentheses to make complex expressions clear.

Next, you will use comparisons and booleans to build conditions.
