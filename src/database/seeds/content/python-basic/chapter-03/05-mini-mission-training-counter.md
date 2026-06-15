## Purpose and Use Case

Games and learning apps constantly count progress: attempts, streaks, stages, and milestones.

This counter is a training coach counting reps and calling out milestones.

## Core Concept

> Build a loop that counts progress and reacts to important moments. The goal is controlled repetition with clear output.

## Technical Breakdown

- Choose a start and end point.
- Loop through each training step.
- Print normal progress for each step.
- Add a condition for milestones such as halfway or complete.

### Concept Summary

| Progress | Message | Reason |
|---|---|---|
| 1-4 | Training rep | Normal progress |
| 5 | Halfway boost | Milestone |
| 10 | Complete | End state |

### Guided Example

```python
total_reps = 10

for rep in range(1, total_reps + 1):
    print("Rep", rep)
    if rep == 5:
        print("Halfway boost unlocked")

print("Training complete")
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Make loop output readable; counters are debugging tools too.
- **Tip 2:** Use constants like `total_reps` instead of automatic behavior numbers repeated everywhere.
- **Tip 3:** Test with small totals before scaling up.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Add a message when the final rep is reached.
- Modify one value in the guided example and predict the new output before executing it.
