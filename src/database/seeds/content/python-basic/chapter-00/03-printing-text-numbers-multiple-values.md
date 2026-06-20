# Printing Text, Numbers, and Multiple Values

## Purpose and Use Case

Output means showing information from a program.

In Python, the most common way to show output is the `print()` function.

You use `print()` to show messages, display numbers, debug simple programs, show results, and make invisible program behavior visible.

## Core Concept

The `print()` function displays values on the screen.

```python
print("Hello")
```

Output:

```text
Hello
```

You can print text, numbers, and multiple values.

## Printing Text

Text must be placed inside quotation marks.

```python
print("Python World")
```

Output:

```text
Python World
```

This text is a string.

You can use double quotes or single quotes.

```python
print("Hello")
print('Hello')
```

Both are valid.

## Printing Numbers

Numbers do not need quotation marks.

```python
print(100)
print(3.14)
```

Output:

```text
100
3.14
```

If you put numbers inside quotes, they become text.

```python
print("100")
```

This still displays `100`, but Python treats it as text, not a number.

## Printing Multiple Values

You can print multiple values using commas.

```python
print("Python", "World")
```

Output:

```text
Python World
```

Python automatically adds a space between values separated by commas.

## The Difference Between + and ,

The `+` operator joins strings directly.

```python
print("Python" + "World")
```

Output:

```text
PythonWorld
```

The comma prints multiple values with spaces between them.

```python
print("Python", "World")
```

Output:

```text
Python World
```

## Try it Yourself

Change the text and numbers.

```python-run
print("Python" + "World")
print("Python", "World")
print("Score:", 100)
print("Level", 1)
```

## Common Mistake: Missing Quotes

This code is wrong:

```python
print(Hello)
```

Python sees `Hello` as a variable name.

If no variable named `Hello` exists, Python raises:

```text
NameError
```

Correct version:

```python
print("Hello")
```

## Best Practices

Use `print()` when you want to see what your program is doing.

Use commas when printing text and numbers together:

```python
print("Score:", 100)
```

Use clear labels:

```python
print("Total coins:", 25)
```

Clear output is easier to understand.

## Concept Summary

`print()` shows output.

Key ideas:

```text
Text needs quotation marks
Numbers can be printed directly
Comma prints multiple values with spaces
+ joins strings directly
Missing quotes can cause NameError
```

Printing is the first step toward making programs visible.
