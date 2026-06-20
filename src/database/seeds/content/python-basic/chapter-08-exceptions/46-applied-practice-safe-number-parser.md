# Applied Practice: Safe Number Parser

## Purpose and Use Case

This lesson is part of **Exceptions**.

Build a safe parser that turns text into numbers when possible and gives useful feedback when not.

The goal is not only to memorize syntax. The goal is to understand how this idea helps a beginner write clearer, safer, and more useful Python programs.

You will use this concept in small scripts, roadmap challenges, quiz questions, and later DSA lessons.

## Core Concept

The core idea of this lesson is **safe parser**.

In beginner Python, each concept should answer one question:

```text
What problem does this solve?
When should I use it?
What mistake should I avoid?
```

For this lesson, remember:

```text
Safe parsing handles bad input without crashing.
```

## Technical Breakdown

Here is a basic example:

```python
def parse_number(text):
    try:
        return int(text)
    except ValueError:
        return None

print(parse_number("42"))
print(parse_number("oops"))
```

This example is intentionally small. Small examples make it easier to see what Python is doing.

When reading Python code, go line by line:

```text
1. Identify the data.
2. Identify the operation.
3. Predict the result.
4. Run the code and compare.
```

## Try it Yourself

Run the code, then change one value and run it again.

```python-run
def parse_number(text):
    try:
        return int(text)
    except ValueError:
        return None

print(parse_number("42"))
print(parse_number("oops"))
```

## Common Mistake

A common beginner mistake is using the syntax without understanding the purpose.

Before writing code, ask:

```text
What value am I working with?
What should happen next?
What output or result do I expect?
```

If the output is different from what you expected, read the code from top to bottom and check each value.

## Best Practices

Keep your code small while learning.

Use clear variable names.

Add readable output with `print()` when testing.

Run the program after every small change.

Do not ignore errors. Error messages are clues.

## Concept Summary

In this lesson, you learned the beginner foundation of **safe parser**.

Key takeaway:

```text
Safe parsing handles bad input without crashing.
```

This concept will appear again in later practice, roadmap games, and larger Python programs.
