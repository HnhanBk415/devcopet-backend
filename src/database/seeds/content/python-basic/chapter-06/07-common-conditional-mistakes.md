# Common Conditional Mistakes

Conditional mistakes can cause syntax errors or incorrect program behavior. The most common issues are missing colons, wrong indentation, using `=` instead of `==`, and ordering conditions poorly.

---

## Learning Goals

By the end of this lesson, you should be able to:

- Use colons after condition headers.
- Indentation controls which code belongs to a block.
- Use `==` for equality comparisons.

---

## 1. Missing colon

An `if`, `elif`, or `else` line needs a colon at the end.

```python
score = 80
if score >= 70:
    print("Passed")
```

Output:

```text
Passed
```

---

## 2. Indentation mistakes

Indented lines belong inside the condition block. Unindented lines run regardless.

```python
is_ready = False
if is_ready:
    print("Start")
print("This always runs")
```

Output:

```text
This always runs
```

---

## 3. Assignment vs comparison

Use `==` to compare. A single `=` is for assigning values.

```python
password = "abc"
print(password == "abc")
```

Output:

```text
True
```

---

## Mini Practice

1. Fix an if statement missing a colon.
2. Move a line in and out of an if block to see the difference.
3. Practice using `==` for comparison.

---

## Summary

- Use colons after condition headers.
- Indentation controls which code belongs to a block.
- Use `==` for equality comparisons.

Next, you will learn how loops repeat tasks automatically.
