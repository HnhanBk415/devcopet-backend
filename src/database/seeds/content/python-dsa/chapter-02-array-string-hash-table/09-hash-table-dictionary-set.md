# Hash Table with Dictionary and Set

## Purpose and Use Case

A hash table is a data structure that allows fast lookup.

In Python, the most common hash table structures are:

```text
dict
set
```

Dictionaries and sets are very useful in DSA because they help you quickly check whether something exists.

You will use them for:

* Counting frequency.
* Checking duplicates.
* Fast lookup.
* Grouping data.
* Mapping keys to values.

## Core Concept

### Dictionary

A dictionary stores key-value pairs.

```python
student = {
    "name": "Alice",
    "score": 95
}

print(student["name"])
```

Output:

```text
Alice
```

A dictionary maps a key to a value.

```text
"name"  → "Alice"
"score" → 95
```

### Set

A set stores unique values.

```python
numbers = {1, 2, 3, 3}

print(numbers)
```

Possible output:

```text
{1, 2, 3}
```

The duplicate `3` is stored only once.

## Technical Breakdown

## Using a Set to Check Duplicates

Problem:

```text
Given a list, check if it contains duplicate values.
```

Simple solution with a set:

```python
numbers = [1, 2, 3, 2]

seen = set()
has_duplicate = False

for number in numbers:
    if number in seen:
        has_duplicate = True
        break

    seen.add(number)

print(has_duplicate)
```

Output:

```text
True
```

The set stores values we have already seen.

Checking `number in seen` is usually fast.

Time complexity:

```text
O(n)
```

Space complexity:

```text
O(n)
```

## Try it Yourself

Change the list and run the code.

```python-run
numbers = [1, 2, 3, 2]

seen = set()
has_duplicate = False

for number in numbers:
    if number in seen:
        has_duplicate = True
        break

    seen.add(number)

print(has_duplicate)
```

## Using a Dictionary to Count Frequency

Problem:

```text
Count how many times each character appears in a word.
```

Python code:

```python
word = "banana"

freq = {}

for char in word:
    if char not in freq:
        freq[char] = 0

    freq[char] += 1

print(freq)
```

Output:

```text
{'b': 1, 'a': 3, 'n': 2}
```

The dictionary stores:

```text
character → count
```

This pattern is very common in string problems.

## Dictionary Lookup

Dictionaries are useful when you need to map one thing to another.

Example:

```python
scores = {
    "Alice": 90,
    "Bob": 85,
    "Tom": 78
}

print(scores["Bob"])
```

Output:

```text
85
```

Instead of scanning a list of names, we can directly look up the key.

## Important Note About Keys

Dictionary keys must be hashable.

Common hashable keys:

```text
strings
numbers
tuples
```

Lists cannot be dictionary keys because lists can change.

This causes an error:

```python
my_dict = {}

my_dict[[1, 2]] = "value"
```

A tuple works:

```python
my_dict = {}

my_dict[(1, 2)] = "value"

print(my_dict[(1, 2)])
```

Output:

```text
value
```

## Best Practices

Use a set when you only need to know whether a value exists.

Use a dictionary when you need to connect a key with a value.

Common uses:

```text
set  → duplicate checking, membership lookup
dict → frequency counting, mapping, grouping
```

Be careful with unordered behavior. Dictionaries keep insertion order in modern Python, but in DSA, you should mainly think of them as fast key-value lookup structures.

## Concept Summary

A hash table allows fast lookup.

In Python:

```text
dict = key-value mapping
set = unique values
```

They are useful for:

```text
Checking duplicates
Counting frequency
Looking up values quickly
Mapping one value to another
```

Hash tables are one of the most important tools for optimizing DSA problems.
