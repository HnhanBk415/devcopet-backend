# String Basics and Common Operations

## Purpose and Use Case

A string is a sequence of characters.

Strings are used to store and process text.

In DSA, many problems involve strings, such as:

* Checking if a word is a palindrome.
* Counting characters.
* Searching for a substring.
* Comparing two strings.
* Reversing text.
* Processing user input.

Understanding strings is important because text data appears in many real applications.

## Core Concept

In Python, a string is written using quotes.

```python
word = "hello"
```

A string is ordered, so each character has an index.

```python
word = "hello"

print(word[0])
print(word[1])
```

Output:

```text
h
e
```

Like lists, string indexes start from `0`.

## Technical Breakdown

### String Length

Use `len()` to get the number of characters.

```python
word = "hello"

print(len(word))
```

Output:

```text
5
```

### Traversing a String

You can loop through a string character by character.

```python
word = "cat"

for char in word:
    print(char)
```

Output:

```text
c
a
t
```

### String Concatenation

You can join strings using `+`.

```python
first = "Data"
second = "Structure"

result = first + " " + second

print(result)
```

Output:

```text
Data Structure
```

### String Slicing

Slicing gets part of a string.

```python
word = "algorithm"

print(word[0:4])
```

Output:

```text
algo
```

`word[0:4]` means:

```text
Start at index 0
Stop before index 4
```

### Reversing a String

Python can reverse a string using slicing:

```python
word = "hello"

print(word[::-1])
```

Output:

```text
olleh
```

## Try it Yourself

Change the word and observe the output.

```python-run
word = "algorithm"

print(word[0])
print(len(word))
print(word[0:4])
print(word[::-1])
```

## Important Note: Strings Are Immutable

In Python, strings are immutable.

This means you cannot directly change one character inside a string.

This code causes an error:

```python
word = "hello"
word[0] = "H"
```

To create a changed version, you make a new string:

```python
word = "hello"
new_word = "H" + word[1:]

print(new_word)
```

Output:

```text
Hello
```

## Building Strings

If you need to combine a few strings, using `+` is fine.

```python
message = "Hello" + " " + "DSA"
print(message)
```

Output:

```text
Hello DSA
```

If you need to build a string from many parts, using a list and `join()` can be better.

```python
letters = ["D", "S", "A"]

result = "".join(letters)

print(result)
```

Output:

```text
DSA
```

## Best Practices

When solving string problems:

```text
Check the length
Loop through characters
Use slicing carefully
Remember that strings cannot be changed directly
Use a list if you need many modifications
```

Strings are similar to lists in some ways, but the main difference is:

```text
List = mutable
String = immutable
```

Mutable means it can be changed directly.
Immutable means it cannot be changed directly.

## Concept Summary

A string is an ordered sequence of characters.

Key ideas:

```text
Index starts at 0
len(string) gives the length
You can loop through characters
Slicing extracts part of a string
Strings are immutable
```

Strings are very common in DSA problems, especially when working with text, patterns, and character counts.

