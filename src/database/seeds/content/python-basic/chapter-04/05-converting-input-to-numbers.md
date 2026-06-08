# Converting Input to Numbers

Because `input()` returns a string, you must convert it before doing calculations.

Use:

```python
int()
float()
```

---

## Convert to Integer

Use `int()` when the user should enter a whole number.

```python
age = input("Enter your age: ")
age = int(age)

print(age + 1)
```

---

## Convert to Float

Use `float()` when the user may enter a decimal value.

```python
price = input("Enter price: ")
price = float(price)

print(price + 2.5)
```

---

## Convert Directly

You can convert the input immediately.

```python
age = int(input("Enter your age: "))
height = float(input("Enter your height: "))
```

This is shorter, but beginners may find the two-step version easier to read.

---

## Example: Simple Calculator

```python
num1 = float(input("First number: "))
num2 = float(input("Second number: "))

print(num1 + num2)
```

---

## Summary

Convert user input before using it in calculations. Use `int()` for whole numbers and `float()` for decimal numbers.
