# `03-time-complexity-and-big-o.md`

# Time Complexity and Big O

## Purpose and Use Case

Time complexity helps us understand how the running time of an algorithm grows when the input size grows.

A program may run quickly when the input is small. But when the input becomes very large, some solutions can become too slow.

For example, a search feature may work well with 10 items, but it may become slow with 1,000,000 items if the algorithm is not efficient.

Big O notation helps us describe this growth in a simple way.

You will use Big O when you need to:

* Compare different solutions.
* Predict how an algorithm performs with large input.
* Avoid slow code.
* Choose a better data structure or algorithm.

## Core Concept

Big O describes how many operations an algorithm needs as the input size grows.

We usually use `n` to represent the input size.

For example:

```text
n = number of items in a list
```

Common time complexities:

```text
O(1)    Constant time
O(n)    Linear time
O(n²)   Quadratic time
```

Big O does not measure exact seconds.

Instead, it focuses on growth.

For example, two computers may run at different speeds, but an `O(n²)` algorithm will still grow much faster than an `O(n)` algorithm when the input becomes large.

## Technical Breakdown

### O(1): Constant Time

An operation is `O(1)` if it takes about the same amount of work no matter how large the input is.

Example:

```python
numbers = [10, 20, 30, 40, 50]

print(numbers[0])
```

Output:

```text
10
```

Accessing an item by index is constant time.

Even if the list has 5 items or 5 million items, accessing `numbers[0]` is still direct.

### O(n): Linear Time

An algorithm is `O(n)` if the number of operations grows with the input size.

Example:

```python
numbers = [10, 20, 30, 40, 50]

for number in numbers:
    print(number)
```

Output:

```text
10
20
30
40
50
```

If the list has 5 items, the loop runs 5 times.

If the list has 1,000 items, the loop runs 1,000 times.

So this algorithm is `O(n)`.

### O(n²): Quadratic Time

An algorithm is `O(n²)` when it uses nested loops over the same input.

Example:

```python
numbers = [1, 2, 3]

for a in numbers:
    for b in numbers:
        print(a, b)
```

Output:

```text
1 1
1 2
1 3
2 1
2 2
2 3
3 1
3 2
3 3
```

There are 3 numbers.

The outer loop runs 3 times.
For each outer loop, the inner loop also runs 3 times.

Total operations:

```text
3 × 3 = 9
```

If the list has `n` items, the number of pairs is:

```text
n × n = n²
```

So the complexity is `O(n²)`.

## Try it Yourself

Change the list and observe how many pairs are printed.

```python-run
numbers = [1, 2, 3]

for a in numbers:
    for b in numbers:
        print(a, b)
```

## Best Practices

When analyzing time complexity, focus on the part that grows the fastest.

### Ignore constants

Example:

```python
for number in numbers:
    print(number)

for number in numbers:
    print(number)
```

This loop goes through the list twice.

Technically, it is `2n`, but in Big O we simplify it to:

```text
O(n)
```

### Focus on loops

A single loop over `n` items is usually `O(n)`.

Nested loops over the same input are usually `O(n²)`.

### Think about input size

Always ask:

```text
What happens if the input becomes much larger?
```

This question is the main reason we use Big O.

## Concept Summary

Time complexity describes how the running time of an algorithm grows as input size increases.

Common examples:

```text
O(1)  = constant time
O(n)  = linear time
O(n²) = quadratic time
```

Big O helps us compare solutions and understand which solution will scale better for large input.

---


