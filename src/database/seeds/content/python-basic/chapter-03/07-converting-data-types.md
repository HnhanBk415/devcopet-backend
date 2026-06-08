# Converting Data Types

Sometimes a value has the wrong type for what you want to do. Type conversion lets you create a new value in another type, such as converting text input into a number.

---

## Learning Goals

By the end of this lesson, you should be able to:

- Use `int()` for whole-number conversion.
- Use `float()` for decimal-number conversion.
- Use `str()` when joining numbers with text.

---

## 1. Converting to int

Use `int()` when a string contains a whole number and you want to do integer math.

```python
age_text = "18"
age = int(age_text)
print(age + 1)
```

Output:

```text
19
```

---

## 2. Converting to float

Use `float()` when a string contains a decimal number.

```python
price_text = "9.99"
price = float(price_text)
print(price * 2)
```

Output:

```text
19.98
```

---

## 3. Converting to string

Use `str()` when you need to join a number with text.

```python
score = 95
message = "Your score is " + str(score)
print(message)
```

Output:

```text
Your score is 95
```

---

## 4. Conversion can fail

Python cannot convert every string into a number. The text must look like a valid number.

```python
# int("hello") would cause an error
print(int("123"))
```

Output:

```text
123
```

---

## Mini Practice

1. Convert the string `"20"` into an integer and add 5.
2. Convert `"3.5"` into a float and multiply it by 2.
3. Use `str()` to build a sentence with a number.

---

## Summary

- Use `int()` for whole-number conversion.
- Use `float()` for decimal-number conversion.
- Use `str()` when joining numbers with text.
- Conversion only works when the original value is compatible.

Next, you will learn how to get input from users.
