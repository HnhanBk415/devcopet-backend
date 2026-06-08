# Write Your First Hello World Program

Now that your Python environment is ready, it is time to write your first program.

The first program many developers write when learning a new language is called **Hello World**.

It is simple, but important. It helps you confirm that your setup works and that you can successfully run code.

---

## 1. Create a Python File

Open your `python-basic` folder in VS Code.

Create a new file named:

```text
hello.py
```

The `.py` extension means this is a Python file.

Your project folder should now look like this:

```text
python-basic/
└── hello.py
```

---

## 2. Write Your First Line of Code

Inside `hello.py`, write this code:

```python
print("Hello, World!")
```

This is your first Python program.

It may look small, but it already teaches an important idea: a program is a set of instructions that the computer follows.

---

## 3. Understand the Code

Let’s break it down:

```python
print("Hello, World!")
```

### `print`

`print` is a built-in Python function.

A function is a reusable action. The `print` function displays something on the screen.

### Parentheses `()`

The parentheses are used to give information to the function.

In this case, we are giving the text we want to display.

### Quotation Marks `" "`

The text inside quotation marks is called a **string**.

A string is a piece of text.

Here, the string is:

```text
Hello, World!
```

So this line means:

```text
Display the text Hello, World! on the screen.
```

---

## 4. Run the Program

Open the terminal inside VS Code:

```text
Terminal → New Terminal
```

Make sure the terminal is inside your `python-basic` folder.

Run this command:

```bash
python hello.py
```

If that does not work, try:

```bash
python3 hello.py
```

You should see this output:

```text
Hello, World!
```

Congratulations. You have written and run your first Python program.

---

## 5. Try Changing the Message

Now change the code to display your own message.

Example:

```python
print("Welcome to Python!")
```

Run the file again:

```bash
python3 hello.py
```

Expected output:

```text
Welcome to Python!
```

You can print almost any text you want:

```python
print("My name is Alex.")
print("I am learning Python.")
print("This is my first program.")
```

Output:

```text
My name is Alex.
I am learning Python.
This is my first program.
```

Each `print` statement displays text on a new line.

---

## 6. Common Mistakes

When writing your first program, you may see errors. That is normal.

Errors are part of programming. They help you understand what needs to be fixed.

### Mistake 1: Missing Quotation Marks

Incorrect:

```python
print(Hello, World!)
```

Python will not understand this because `Hello, World!` is text, so it must be inside quotation marks.

Correct:

```python
print("Hello, World!")
```

### Mistake 2: Missing Parenthesis

Incorrect:

```python
print("Hello, World!"
```

Correct:

```python
print("Hello, World!")
```

Python needs both opening and closing parentheses.

### Mistake 3: Wrong File Name

If your file is named differently, such as:

```text
hello_world.py
```

then you must run:

```bash
python3 hello_world.py
```

The command must match the file name.

---

## 7. Mini Practice

Try the following tasks:

1. Print your name.
2. Print the name of your favorite programming language.
3. Print three different lines using three `print` statements.
4. Change `"Hello, World!"` to another sentence and run the file again.

Example:

```python
print("My name is Sam.")
print("Python is fun.")
print("I just ran my first program.")
```

---

## 8. What You Learned

In this lesson, you learned how to:

* Create a Python file.
* Write a simple Python program.
* Use the `print()` function.
* Run a Python file from the terminal.
* Fix common beginner mistakes.

---

## Summary

You have successfully written your first Python program.

The `print()` function is one of the simplest but most useful tools in Python. It allows your program to show information to the user.

In the next lessons, you will continue using `print()` and learn how to write clearer, more useful Python programs.
