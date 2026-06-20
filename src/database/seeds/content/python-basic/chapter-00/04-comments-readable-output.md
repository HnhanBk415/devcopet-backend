# Comments and Readable Output

## Purpose and Use Case

Code is written for the computer, but it is also read by humans.

Readable code helps you understand your own work later.

Comments and clear output make code easier to follow.

You use comments to explain why something exists, leave notes for yourself, make beginner code easier to understand, and mark sections of a small program.

## Core Concept

A comment is text in code that Python ignores.

In Python, a single-line comment starts with `#`.

```python
# This line is a comment
print("Hello")
```

Python runs the `print()` line but ignores the comment.

Output:

```text
Hello
```

## Technical Breakdown

Comments can explain the purpose of code.

```python
# Show a welcome message
print("Welcome to Python World")
```

Comments can also mark sections:

```python
# User introduction
print("Name: DevCopet")
print("Role: Learning Assistant")
```

Comments should help the reader. They should not simply repeat the code in an obvious way.

Less useful:

```python
# print Hello
print("Hello")
```

More useful:

```python
# Show the first message the user sees
print("Hello")
```

## Readable Output

Readable output means the screen result is easy to understand.

Not very clear:

```python
print(100)
```

Clearer:

```python
print("Score:", 100)
```

Output:

```text
Score: 100
```

Labels help users understand what the value means.

## Try it Yourself

Change the labels and messages.

```python-run
# Greeting section
print("Welcome to Python World")

# Player information
print("Player:", "Nova")
print("Level:", 1)
print("XP:", 50)
```

## Comments vs Output

Comments are for code readers. Output is for program users.

```python
# This explains the code to a human reader
print("This appears on the screen")
```

The comment does not appear in the output. Only the `print()` message appears.

## Common Mistake: Too Many Comments

Comments are helpful, but too many comments can make code messy.

Bad:

```python
# Print the word Hello
print("Hello")
# Print the word World
print("World")
```

Better:

```python
# Show a two-line greeting
print("Hello")
print("World")
```

## Best Practices

Use comments to explain intention, not obvious syntax.

Use clear output labels.

Keep messages simple.

Use comments to organize beginner programs into sections.

## Concept Summary

Comments and readable output make code easier to understand.

Key ideas:

```text
# starts a single-line comment
Python ignores comments
Comments help humans read code
print() shows output to the user
Clear labels make output easier to understand
```

Good code is readable by both the computer and the next human who reads it.
