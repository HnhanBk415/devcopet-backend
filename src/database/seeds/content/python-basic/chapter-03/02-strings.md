# Strings

A string is text in Python. You use strings for names, messages, labels, sentences, and any value that should be treated as text instead of a number.

---

## Learning Goals

By the end of this lesson, you should be able to:

- Strings store text values.
- Strings are written inside quotes.
- Use `+` to join strings, but remember to add spaces manually.

---

## 1. Creating strings

A string is usually written inside single quotes or double quotes. Both styles work as long as the opening and closing quote match.

```python
name = "Alex"
city = 'Da Nang'
print(name)
print(city)
```

Output:

```text
Alex
Da Nang
```

---

## 2. Joining strings

You can join strings with `+`. This is called concatenation. Remember to include spaces yourself if you want spaces in the result.

```python
first_name = "Linh"
last_name = "Vo"
full_name = first_name + " " + last_name
print(full_name)
```

Output:

```text
Linh Vo
```

---

## 3. Strings can contain numbers

A string can contain digits, but Python still treats it as text. You cannot do math with it until you convert it.

```python
score_text = "100"
print(score_text + " points")
```

Output:

```text
100 points
```

---

## Mini Practice

1. Create a variable called `pet_name` and store a string in it.
2. Print a greeting that includes the pet name.
3. Try joining two strings with and without a space.

---

## Summary

- Strings store text values.
- Strings are written inside quotes.
- Use `+` to join strings, but remember to add spaces manually.

Next, you will learn about integers, the data type for whole numbers.
