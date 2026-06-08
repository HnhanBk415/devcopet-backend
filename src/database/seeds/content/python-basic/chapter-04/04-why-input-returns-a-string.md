# Why input() Returns a String

A very common beginner mistake is assuming that numeric input is automatically a number. In Python, `input()` always returns a string.

---

## Learning Goals

By the end of this lesson, you should be able to:

- `input()` always returns a string.
- String `+` joins text instead of doing math.
- Convert input before numeric calculations.

---

## 1. All input starts as text

Even if the user types digits, Python receives them as a string.

```python
age = input("Age: ")
print(type(age))
```

Output:

```text
Age: 18
<class 'str'>
```

---

## 2. String behavior can surprise you

If you use `+` with input strings, Python joins them instead of adding numbers.

```python
a = input("First number: ")
b = input("Second number: ")
print(a + b)
```

Output:

```text
First number: 2
Second number: 3
23
```

---

## 3. Convert before math

Use `int()` or `float()` before doing numeric calculations.

```python
a = int(input("First number: "))
b = int(input("Second number: "))
print(a + b)
```

Output:

```text
First number: 2
Second number: 3
5
```

---

## Mini Practice

1. Ask for two numbers and print their raw string result with `+`.
2. Convert both values with `int()` and add them.
3. Use `type()` to confirm the difference.

---

## Summary

- `input()` always returns a string.
- String `+` joins text instead of doing math.
- Convert input before numeric calculations.

Next, you will focus on converting input to numbers safely.
