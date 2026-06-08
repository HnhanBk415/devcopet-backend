# Floats

A float is a number with a decimal point. You use floats for measurements, prices, averages, percentages, and calculations that may not be whole numbers.

---

## Learning Goals

By the end of this lesson, you should be able to:

- Floats store decimal numbers.
- A number with a decimal point is a float.
- Float precision can sometimes produce tiny display differences.

---

## 1. Creating floats

A float is written with a decimal point. Even `5.0` is a float because it includes `.0`.

```python
price = 9.99
height = 1.72
exact_five = 5.0
print(price)
print(height)
print(exact_five)
```

Output:

```text
9.99
1.72
5.0
```

---

## 2. Math with floats

Floats can be used in calculations. If an expression mixes an int and a float, the result is usually a float.

```python
total = 10 + 2.5
print(total)
```

Output:

```text
12.5
```

---

## 3. Be careful with precision

Computers store decimal numbers in binary, so some float results may look slightly unexpected. This is normal in many programming languages.

```python
print(0.1 + 0.2)
```

Output:

```text
0.30000000000000004
```

---

## Mini Practice

1. Create variables for price and tax rate.
2. Multiply them to estimate tax.
3. Try adding `0.1 + 0.2` and observe the result.

---

## Summary

- Floats store decimal numbers.
- A number with a decimal point is a float.
- Float precision can sometimes produce tiny display differences.

Next, you will learn about booleans, the type for true/false values.
