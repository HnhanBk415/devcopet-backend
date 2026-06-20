# What Python Is and How Programs Run

## Purpose and Use Case

Python is a programming language. A programming language lets humans give instructions to a computer in a structured way.

Python is popular because its syntax is readable and beginner-friendly. It is used for automation, web development, data analysis, artificial intelligence, scripting, and learning programming fundamentals.

In this course, Python is the language you will use to understand how programs think, store data, make decisions, repeat tasks, and solve problems.

## Core Concept

A Python program is a sequence of instructions.

Python does not guess what you want. It follows exactly what you write.

Think of Python as a very patient instruction runner.

```text
You write code
Python reads the code
Python executes the instructions
The computer shows the result
```

If the instruction is clear, Python runs it. If the instruction has a mistake, Python shows an error.

## Technical Breakdown

A very small Python program can look like this:

```python
print("Hello, Python!")
```

This program has one instruction: display the text `Hello, Python!`.

Output:

```text
Hello, Python!
```

The `print()` function shows information on the screen.

The text inside quotation marks is called a string.

```python
"Hello, Python!"
```

A string is text data.

## Code Runs Step by Step

Python runs code from top to bottom.

```python
print("Start")
print("Learning Python")
print("Done")
```

Output:

```text
Start
Learning Python
Done
```

Python does not run the last line first. It follows the order of the program.

## Try it Yourself

Change the text inside `print()` and run the code.

```python-run
print("Hello, Python!")
print("I am learning programming.")
print("This is my first Python lesson.")
```

## Common Mistake

This code is incorrect:

```python
print(Hello)
```

Python thinks `Hello` is a variable name, not text. If no variable named `Hello` exists, Python raises an error.

Correct version:

```python
print("Hello")
```

## Best Practices

Start with small programs. Run your code often. Read error messages slowly.

Use `print()` to see what your program is doing.

Do not worry if you make mistakes. Debugging is part of programming.

## Concept Summary

Python is a programming language that runs instructions step by step.

Key ideas:

```text
Code = instructions for the computer
Python = instruction runner
print() = shows output
String = text inside quotation marks
Error = Python cannot understand or safely run something
```

Once you understand that Python follows instructions exactly, learning the rest of programming becomes much easier.
