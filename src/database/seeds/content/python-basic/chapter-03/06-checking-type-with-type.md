# Checking Type with type()

When you are not sure what type a value has, Python gives you a built-in function called `type()`. This function helps you debug code and understand why a value behaves a certain way.

---

## Learning Goals

By the end of this lesson, you should be able to:

- `type()` shows the data type of a value.
- It is useful for debugging confusing behavior.
- Expressions also have types.

---

## 1. Using type()

Pass a value or variable into `type()` to see its data type.

```python
name = "Alex"
age = 18
height = 1.72
print(type(name))
print(type(age))
print(type(height))
```

Output:

```text
<class 'str'>
<class 'int'>
<class 'float'>
```

---

## 2. Why type() helps

If your code behaves strangely, checking the type can reveal that a value is text when you expected a number.

```python
score = "100"
print(type(score))
print(score + " points")
```

Output:

```text
<class 'str'>
100 points
```

---

## 3. Checking expressions

You can also use `type()` on expressions, not only variables.

```python
print(type(10 + 5))
print(type(10 / 5))
print(type(10 > 5))
```

Output:

```text
<class 'int'>
<class 'float'>
<class 'bool'>
```

---

## Mini Practice

1. Use `type()` on a string, integer, float, and boolean.
2. Use `type()` on the result of `5 + 2`.
3. Use `type()` on the result of `5 > 2`.

---

## Summary

- `type()` shows the data type of a value.
- It is useful for debugging confusing behavior.
- Expressions also have types.

Next, you will learn how to convert values from one type to another.
