# Storing Input in Variables

Input is most useful when you save it. A variable lets you reuse the user's answer multiple times in your program.

---

## Learning Goals

By the end of this lesson, you should be able to:

- Input values can be stored in variables.
- Stored input can be reused multiple times.
- Multiple inputs should use separate meaningful variables.

---

## 1. Store first, use later

Assign the result of `input()` to a variable.

```python
name = input("Name: ")
print("Hello, " + name)
print(name + " is learning Python.")
```

Output:

```text
Name: Ana
Hello, Ana
Ana is learning Python.
```

---

## 2. Multiple inputs

You can ask several questions and store each answer separately.

```python
name = input("Name: ")
city = input("City: ")
print(name + " lives in " + city)
```

Output:

```text
Name: Nam
City: Hue
Nam lives in Hue
```

---

## 3. Variables make code flexible

Changing the user's input changes the program's output without changing the code.

```python
pet = input("Pet name: ")
print("Your pet " + pet + " sounds awesome!")
```

Output:

```text
Pet name: Milo
Your pet Milo sounds awesome!
```

---

## Mini Practice

1. Ask for name and city.
2. Store both answers.
3. Print a sentence that uses both variables.

---

## Summary

- Input values can be stored in variables.
- Stored input can be reused multiple times.
- Multiple inputs should use separate meaningful variables.

Next, you will learn why input values are strings by default.
