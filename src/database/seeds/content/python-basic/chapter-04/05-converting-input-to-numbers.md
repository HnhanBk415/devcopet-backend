# Converting Input to Numbers

Many interactive programs ask for numbers. Since `input()` returns strings, conversion is needed before doing math.

---

## Learning Goals

By the end of this lesson, you should be able to:

- Use `int()` for whole-number input.
- Use `float()` for decimal input.
- Conversion requires valid numeric text.

---

## 1. Use int() for whole numbers

If the user should type a whole number, wrap the input with `int()`.

```python
age = int(input("Age: "))
print(age + 1)
```

Output:

```text
Age: 18
19
```

---

## 2. Use float() for decimals

If the user may type a decimal number, use `float()`.

```python
price = float(input("Price: "))
print(price * 2)
```

Output:

```text
Price: 4.5
9.0
```

---

## 3. Invalid input causes errors

If the user types something that cannot be converted, Python raises an error. Later you can handle this with exception handling.

```python
# int("abc") would fail
number = int("123")
print(number)
```

Output:

```text
123
```

---

## Mini Practice

1. Ask for a whole number and double it.
2. Ask for a decimal price and calculate two items.
3. Try typing invalid input and observe the error.

---

## Summary

- Use `int()` for whole-number input.
- Use `float()` for decimal input.
- Conversion requires valid numeric text.

Next, you will review common mistakes when using input.
