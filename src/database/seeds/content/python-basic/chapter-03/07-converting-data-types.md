# Converting Data Types

Sometimes you need to change a value from one type to another. This is called **type conversion** or **type casting**.

Python provides functions such as:

```python
str()
int()
float()
bool()
```

---

## Convert to a String

Use `str()` to convert a value to text.

```python
age = 18
message = "I am " + str(age) + " years old"
print(message)
```

Output:

```text
I am 18 years old
```

---

## Convert to an Integer

Use `int()` to convert a valid number string to an integer.

```python
year = "2026"
print(int(year) + 1)
```

Output:

```text
2027
```

---

## Convert to a Float

Use `float()` for decimal numbers.

```python
price = "9.99"
print(float(price) + 1)
```

Output:

```text
10.99
```

---

## Conversion Can Fail

This will cause an error:

```python
number = int("hello")
```

Python cannot convert the word `hello` into a number.

---

## Quick Practice

```python
score = "85"
bonus = 5

final_score = int(score) + bonus
print(final_score)
```

---

## Summary

Type conversion lets you change values into the type your program needs. This is especially important when working with user input and calculations.
