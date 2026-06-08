# Set Up Python and a Code Editor

Before writing your first Python program, you need two things:

1. **Python** — the language that will run your code.
2. **A code editor** — the tool where you write and manage your code.

In this lesson, you will set up your local Python development environment step by step.

---

## 1. What Is Python?

Python is a programming language that is beginner-friendly, readable, and widely used in many areas, such as:

* Web development
* Data analysis
* Artificial intelligence
* Automation
* Backend development
* Education and learning platforms

One of the reasons Python is popular is that its syntax is simple and close to natural English.

For example:

```python
print("Hello, world!")
```

This line tells Python to display the text `Hello, world!` on the screen.

---

## 2. Install Python

To write and run Python programs on your computer, you first need to install Python.

### Step 1: Download Python

Go to the official Python website:

```text
https://www.python.org/downloads/
```

Download the latest stable version for your operating system.

### Step 2: Install Python

Run the installer.

If you are using Windows, make sure to check this option before clicking install:

```text
Add Python to PATH
```

This allows you to run Python from the terminal.

On macOS, you can install Python using the official installer or a package manager such as Homebrew.

Example with Homebrew:

```bash
brew install python
```

---

## 3. Check If Python Is Installed

After installing Python, open your terminal.

On macOS, open **Terminal**.

On Windows, open **Command Prompt** or **PowerShell**.

Run this command:

```bash
python --version
```

If that does not work, try:

```bash
python3 --version
```

You should see something like:

```text
Python 3.x.x
```

This means Python is installed successfully.

---

## 4. What Is a Code Editor?

A code editor is an application that helps you write code more easily.

It usually provides features like:

* Syntax highlighting
* Auto-completion
* File management
* Terminal integration
* Extensions for different languages

For this course, we recommend using **Visual Studio Code**, usually called **VS Code**.

---

## 5. Install Visual Studio Code

Go to the official VS Code website:

```text
https://code.visualstudio.com/
```

Download and install the version for your operating system.

After installing VS Code, open it and install the Python extension.

### Install the Python Extension

In VS Code:

1. Open the Extensions panel.
2. Search for `Python`.
3. Install the official Python extension by Microsoft.

This extension helps VS Code understand Python files and provides useful features while you code.

---

## 6. Create Your First Project Folder

It is a good habit to keep your code organized in a project folder.

Create a folder named:

```text
python-basic
```

Inside this folder, you will store your Python files during this course.

Example structure:

```text
python-basic/
└── hello.py
```

The file `hello.py` will contain your first Python program in the next lesson.

---

## 7. Open the Folder in VS Code

Open VS Code, then choose:

```text
File → Open Folder
```

Select the `python-basic` folder you created.

Now you are ready to create Python files inside this project.

---

## 8. Use the Integrated Terminal

VS Code includes a built-in terminal.

To open it:

```text
Terminal → New Terminal
```

This terminal lets you run Python commands without leaving VS Code.

For example, you can check your Python version inside VS Code:

```bash
python3 --version
```

or:

```bash
python --version
```

The correct command may depend on your operating system and installation.

---

## 9. Quick Environment Checklist

Before moving to the next lesson, make sure you have completed the following:

* Python is installed.
* You can check the Python version from the terminal.
* VS Code is installed.
* The Python extension is installed in VS Code.
* You have created a folder named `python-basic`.
* You can open the folder in VS Code.
* You can open the terminal inside VS Code.

---

## Summary

In this lesson, you prepared your Python development environment.

You installed Python, set up a code editor, created a project folder, and learned how to use the terminal to check your installation.

In the next lesson, you will write and run your first Python program: **Hello World**.
