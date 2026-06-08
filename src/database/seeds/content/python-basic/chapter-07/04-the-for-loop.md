# The for Loop

A `for` loop is commonly used when you know the sequence you want to go through. It can loop over ranges, strings, lists, and more.

---

## Learning Goals

By the end of this lesson, you should be able to:

- For loops iterate over a sequence.
- The loop variable changes each iteration.
- `range()` is commonly used with for loops.

---

## 1. Looping with range

`range()` creates a sequence of numbers for the loop.

```python
for i in range(3):
    print(i)
```

Output:

```text
0
1
2
```

---

## 2. Loop variable

The loop variable takes one value at a time from the sequence.

```python
for number in range(1, 4):
    print("Number:", number)
```

Output:

```text
Number: 1
Number: 2
Number: 3
```

---

## 3. Looping over text

A for loop can go through each character in a string.

```python
for letter in "cat":
    print(letter)
```

Output:

```text
c
a
t
```

---

## Mini Practice

1. Use a for loop to print numbers 0 to 4.
2. Use a for loop to print numbers 1 to 5.
3. Loop over the letters in your name.

---

## Summary

- For loops iterate over a sequence.
- The loop variable changes each iteration.
- `range()` is commonly used with for loops.

Next, you will learn more about using `range()`.
