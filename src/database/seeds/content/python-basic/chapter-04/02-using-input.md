# Using input()

The `input()` function asks the user to type something.

Basic syntax:

```python
variable = input("Question here: ")
```

The value typed by the user is stored in the variable.

---

## First Example

```python
name = input("Enter your name: ")
print("Hello, " + name + "!")
```

Example run:

```text
Enter your name: Maya
Hello, Maya!
```

---

## The Prompt Text

The text inside `input()` is called the **prompt**. It tells the user what to enter.

Good prompt:

```python
city = input("Enter your city: ")
```

Less clear prompt:

```python
city = input("Type: ")
```

Clear prompts make your program easier to use.

---

## Add a Space After the Prompt

It is common to include a space at the end of the prompt.

```python
name = input("Name: ")
```

This makes the input look cleaner in the terminal.

---

## Quick Practice

Write a program that asks for a favorite color:

```python
color = input("What is your favorite color? ")
print("Your favorite color is " + color)
```

---

## Summary

Use `input()` to ask the user for information. Store the result in a variable so you can use it later.
