## Purpose and Use Case

Access rules appear everywhere: lessons, dashboards, admin tools, checkout flows, and subscription features. A small mistake can show the wrong page or block the right user.

This practice combines `if`, `elif`, `else`, and boolean logic into a clear access decision. The goal is not just to make it work, but to make the rule easy to inspect.

## Core Concept

An access gate is a conditional flow that checks user state and chooses a response. The best access gates are explicit, ordered, and easy to test.

## Technical Breakdown

### Define the inputs

Start with the facts your program needs.

```python
is_logged_in = True
is_banned = False
completed_intro = True
xp = 120
```

Each variable should represent one clear piece of information.

### Write the highest-priority rejection first

```python
if not is_logged_in:
    print("Please log in first")
elif is_banned:
    print("Account access is restricted")
elif not completed_intro:
    print("Complete the introduction first")
elif xp < 100:
    print("Earn more XP to continue")
else:
    print("Access granted")
```

This order is intentional. The program handles blocking cases before granting access.

### Why this order works

| Check | Reason |
|---|---|
| Login first | Unknown users should not continue |
| Ban status early | Restrictions override progress |
| Progress next | Learning path remains controlled |
| XP last | Numeric requirement is easy to explain |

The final `else` becomes meaningful because every rejection has already been handled.

### Improve readability with named rules

```python
has_enough_xp = xp >= 100
can_open_lesson = is_logged_in and not is_banned and completed_intro and has_enough_xp

if can_open_lesson:
    print("Access granted")
else:
    print("Access denied")
```

This version is compact, but it gives less detail about why access was denied. Choose the version based on the user experience you need.

## Best Practices

- Put the most serious rejection rules first.
- Give each rejection a clear message.
- Avoid hiding too many checks inside one long condition.
- Test every branch with a separate set of input values.

> **Rule:** A good access gate should answer both questions: “Can the user continue?” and “If not, why?”

## Concept Summary

**Key idea:** Access gates combine conditions to choose the correct user-facing response.

| Step | Purpose | Example |
|---|---|---|
| Check blockers | Stop invalid access | `not is_logged_in` |
| Check requirements | Confirm progress | `xp >= 100` |
| Grant access | Run success path | `else` |

> **Rule:** Handle rejection cases before success when the user needs a specific explanation.

## Practice Check

- Build an access gate with `is_logged_in`, `is_banned`, and `xp`.
- Add a different message for each reason access can be denied.
