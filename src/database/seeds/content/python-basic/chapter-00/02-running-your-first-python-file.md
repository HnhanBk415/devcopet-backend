# Running Your First Python File

## Purpose and Use Case

Writing code and running code are two different actions.

A beginner often writes a Python file but forgets that the computer does not run it until they execute it.

This lesson shows the basic idea of creating a Python file and running it from a terminal.

## Core Concept

A Python file usually ends with:

```text
.py
```

Example:

```text
hello.py
```

Inside the file, you write Python code. Then you run the file using Python.

Typical command:

```bash
python hello.py
```

or on some systems:

```bash
python3 hello.py
```

## Technical Breakdown

Suppose you create a file named:

```text
hello.py
```

Inside it, you write:

```python
print("Hello from a Python file!")
```

To run it, open a terminal in the same folder and run:

```bash
python hello.py
```

Output:

```text
Hello from a Python file!
```

On some computers, the command may be:

```bash
python3 hello.py
```

The exact command depends on how Python is installed.

## File Name vs Code Content

The file name and code content are different things.

File name:

```text
hello.py
```

Code inside the file:

```python
print("Hello")
```

The file name helps your computer locate the program. The code inside the file tells Python what to do.

## Try it Yourself

Pretend this code is inside `hello.py`.

```python-run
print("Hello from my first Python file!")
print("I wrote code.")
print("Then I ran the file.")
```

## Common Beginner Mistakes

A common mistake is writing code in a file but not running it.

Another mistake is running the command from the wrong folder.

If your terminal says the file cannot be found, check:

```text
Is the file name correct?
Are you in the correct folder?
Does the file end with .py?
```

## PATH Problem

On Windows, if Python is not added to PATH, the terminal may show:

```text
'python' is not recognized as an internal or external command
```

This means the terminal cannot find the Python command. It does not mean your Python file is deleted.

## Best Practices

Use clear file names.

Good examples:

```text
hello.py
greeting_bot.py
practice_print.py
```

Avoid file names with spaces when you are beginning.

Save your file before running it. Run your file after every small change.

## Concept Summary

A Python file stores code. Running the file tells Python to execute that code.

Key ideas:

```text
Python files usually end with .py
Writing code is not the same as running code
Use python file_name.py or python3 file_name.py to run
Terminal folder matters
PATH helps the terminal find Python
```
