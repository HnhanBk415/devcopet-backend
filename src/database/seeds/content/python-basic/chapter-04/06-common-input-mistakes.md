# Common Input Mistakes

Input bugs are common because user input starts as text and because prompts must be clear. Learning these mistakes helps you debug faster.

---

## Learning Goals

By the end of this lesson, you should be able to:

- Raw input is always text.
- Clear prompts improve user experience.
- String joining requires you to manage spaces and punctuation.

---

## 1. Forgetting conversion

Trying to do math with raw input causes string behavior or errors.

```python
number = input("Number: ")
print(number + number)
```

Output:

```text
Number: 5
55
```

---

## 2. Using unclear prompts

A vague prompt makes the program confusing for users. Clear prompts reduce bad input.

```python
age_text = input("Enter your age as a whole number: ")
print(age_text)
```

Output:

```text
Enter your age as a whole number: 18
18
```

---

## 3. Forgetting spaces in output

When joining strings, include spaces where needed.

```python
name = input("Name: ")
print("Hello, " + name + "!")
```

Output:

```text
Name: Mia
Hello, Mia!
```

---

## Mini Practice

1. Fix a program that adds two raw inputs incorrectly.
2. Rewrite a vague prompt to make it clear.
3. Print a greeting with correct spacing.

---

## Summary

- Raw input is always text.
- Clear prompts improve user experience.
- String joining requires you to manage spaces and punctuation.

Next, you will learn about operators, the symbols used to calculate and compare values.
