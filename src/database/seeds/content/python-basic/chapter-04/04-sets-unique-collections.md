## Purpose and Use Case

Duplicates create messy data: repeated tags, repeated usernames, repeated unlocked badges.

A set is a guest list with a strict bouncer: duplicates do not get in twice.

## Core Concept

> A **set** stores unique values with no guaranteed order. Sets are useful for membership checks and removing duplicates.

## Technical Breakdown

- Create a set with `{}` containing values.
- Use `set(list)` to remove duplicates from a list.
- Membership checks with `in` are fast and readable.
- Sets do not keep positions, so indexing does not work.

### Concept Summary

| Feature | List | Set |
|---|---|---|
| Duplicates | Allowed | Removed |
| Order | Preserved | Not guaranteed |
| Indexing | Yes | No |

### Guided Example

```python
tags = ["python", "beginner", "python", "quiz"]
unique_tags = set(tags)
print(unique_tags)
print("python" in unique_tags)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Use sets for uniqueness, not for display order.
- **Tip 2:** Convert back to a list if you need ordering later.
- **Tip 3:** Sets are great for checking whether a user already has a badge.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Remove duplicate names from a list of participants.
- Modify one value in the guided example and predict the new output before executing it.
