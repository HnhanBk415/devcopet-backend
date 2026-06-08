# Common Input Mistakes

User input is simple, but beginners often make a few common mistakes.

Let's review them.

---

## Mistake 1: Forgetting That input() Returns a String

Incorrect:

```python
age = input("Age: ")
print(age + 1)
```

Correct:

```python
age = int(input("Age: "))
print(age + 1)
```

---

## Mistake 2: Missing a Clear Prompt

Unclear:

```python
name = input()
```

Better:

```python
name = input("Enter your name: ")
```

A clear prompt helps the user understand what to type.

---

## Mistake 3: Converting Invalid Text

This causes an error if the user types text instead of a number:

```python
age = int(input("Age: "))
```

If the user types `hello`, Python cannot convert it to an integer.

---

## Mistake 4: Using Confusing Variable Names

Less clear:

```python
a = input("Name: ")
b = input("City: ")
```

Better:

```python
name = input("Name: ")
city = input("City: ")
```

---

## Summary

When using input, remember: ask clear questions, store answers in meaningful variables, and convert input when you need numbers.
