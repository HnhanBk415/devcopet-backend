# Introducing User Input

User input lets a program receive information while it is running. Instead of hard-coding every value, you can ask the user for a name, age, choice, or number.

---

## Learning Goals

By the end of this lesson, you should be able to:

- `input()` makes programs interactive.
- The prompt should guide the user.
- The program waits at `input()` until the user presses Enter.

---

## 1. Why input matters

Without input, a program always behaves the same way. With input, the program can respond to different users.

```python
name = input("What is your name? ")
print("Hello, " + name)
```

Output:

```text
What is your name? Alex
Hello, Alex
```

---

## 2. Prompts guide the user

The text inside `input()` is called a prompt. It should clearly tell the user what to type.

```python
color = input("Enter your favorite color: ")
print("You chose " + color)
```

Output:

```text
Enter your favorite color: blue
You chose blue
```

---

## 3. Input pauses the program

When Python reaches `input()`, it waits until the user types something and presses Enter.

```python
answer = input("Press Enter after typing yes: ")
print("You typed: " + answer)
```

Output:

```text
Press Enter after typing yes: yes
You typed: yes
```

---

## Mini Practice

1. Ask the user for their name and print a greeting.
2. Ask for a favorite food and print a sentence with it.
3. Write a clear prompt that tells the user exactly what to enter.

---

## Summary

- `input()` makes programs interactive.
- The prompt should guide the user.
- The program waits at `input()` until the user presses Enter.

Next, you will learn the syntax of using `input()` more carefully.
