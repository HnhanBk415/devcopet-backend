# Operator Precedence

Operator precedence is the order Python follows when evaluating an expression.

For example:

```python
print(2 + 3 * 4)
```

Output:

```text
14
```

Python multiplies before it adds.

---

## Use Parentheses

Parentheses can change the order.

```python
print((2 + 3) * 4)
```

Output:

```text
20
```

---

## Common Order

A simple order to remember:

1. Parentheses
2. Exponents
3. Multiplication, division, floor division, modulo
4. Addition and subtraction
5. Comparisons

---

## Write Clear Code

Even if Python knows the order, parentheses can make your code easier to read.

```python
total = price * quantity + shipping
final_total = (price * quantity) + shipping
```

The second version is clearer.

---

## Summary

Operator precedence controls the order of evaluation. Use parentheses when you want to make the order clear.
