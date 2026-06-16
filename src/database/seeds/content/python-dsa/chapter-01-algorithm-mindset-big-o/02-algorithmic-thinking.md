# Algorithmic Thinking

## Purpose and Use Case

Algorithmic thinking means breaking a problem into clear, logical steps before writing code.

In programming, many beginners make the mistake of writing code immediately without understanding the problem first. This often leads to confusing code and many errors.

Algorithmic thinking helps you:

* Understand a problem clearly.
* Plan the solution before coding.
* Write code step by step.
* Debug more easily.
* Improve your solution later.

You will use algorithmic thinking in almost every programming task, from simple exercises to real-world applications.

For example, if you want to count how many even numbers are in a list, you should first think about the steps before writing Python code.

## Core Concept

An algorithm is a step-by-step process for solving a problem.

Before writing code, you should ask:

```text
1. What is the input?
2. What is the expected output?
3. What steps are needed?
4. Are there any special cases?
5. Can the solution be made simpler or faster?
```

A good algorithm should be:

```text
Clear
Correct
Finite
Step-by-step
Efficient enough for the problem
```

You do not need to find the best solution immediately. It is normal to start with a simple idea first.

## Technical Breakdown

Let’s solve this problem:

```text
Given a list of numbers, count how many numbers are even.
```

### Step 1: Understand the input

The input is a list of numbers:

```python
numbers = [1, 2, 3, 4, 5, 6]
```

### Step 2: Define the output

The output should be the number of even numbers.

In this example:

```text
2, 4, and 6 are even numbers.
So the answer is 3.
```

### Step 3: Write the steps in plain English

Before coding, describe the algorithm:

```text
1. Create a counter and set it to 0.
2. Go through each number in the list.
3. If the number is even, increase the counter by 1.
4. After checking all numbers, print the counter.
```

### Step 4: Convert the steps into Python

```python
numbers = [1, 2, 3, 4, 5, 6]

count = 0

for number in numbers:
    if number % 2 == 0:
        count += 1

print(count)
```

Output:

```text
3
```

### Step 5: Explain the logic

```python
count = 0
```

This variable stores how many even numbers we have found.

```python
for number in numbers:
```

This loop checks every number in the list.

```python
if number % 2 == 0:
```

The `%` operator gives the remainder after division.
If a number divided by 2 has a remainder of 0, it is even.

```python
count += 1
```

If the number is even, we increase the counter.

```python
print(count)
```

At the end, we print the total count.

## Try it Yourself

Change the list and run the code.

```python-run
numbers = [1, 2, 3, 4, 5, 6]

count = 0

for number in numbers:
    if number % 2 == 0:
        count += 1

print(count)
```

## Another Example

Problem:

```text
Given a list of names, check if the name "Alice" exists.
```

Plain English steps:

```text
1. Go through each name in the list.
2. If the current name is "Alice", remember that we found it.
3. Stop searching.
4. Print the result.
```

Python code:

```python
names = ["Tom", "Alice", "John"]

found = False

for name in names:
    if name == "Alice":
        found = True
        break

print(found)
```

Output:

```text
True
```

This is also algorithmic thinking. We first understand the goal, then create clear steps, then write code.

## Best Practices

### 1. Do not jump into code too early

Before coding, explain the solution in simple words.

A useful process is:

```text
Understand → Plan → Code → Test → Improve
```

### 2. Use small examples

Small examples make the logic easier to see.

For example:

```text
numbers = [2, 5, 8]
```

It is easier to test your idea with 3 numbers before using a large list.

### 3. Think about edge cases

An edge case is a special situation that may break your solution.

For example:

```text
What if the list is empty?
What if all numbers are odd?
What if all numbers are even?
```

### 4. Keep the first solution simple

Your first solution does not need to be perfect. It should be clear and correct.

You can optimize it later.

## Concept Summary

Algorithmic thinking is the skill of turning a problem into clear steps.

Before writing code, you should understand the input, output, rules, and required steps.

Key idea:

```text
A clear plan makes coding easier.
```

The basic problem-solving flow is:

```text
Understand the problem
Plan the steps
Write the code
Test with examples
Improve the solution
```

Algorithmic thinking is the foundation of DSA because every data structure and algorithm depends on clear problem-solving logic.
