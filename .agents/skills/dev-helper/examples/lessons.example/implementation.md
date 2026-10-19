# Lessons: Implementation

TypeScript patterns, hooks, testing strategies, build/lint behavior, and
engineering practices.

## Entry Format

```
- [Implementation] Pattern observed -> What to do differently -> Why it matters (MTV-XXXX, YYYY-MM-DD)
```

## Lessons

- [Implementation] Reused DOM `data-*` keys and field-id strings in table/DataView code -> centralize in `constants.ts` / `*Constants.ts`; keep `*Utils.ts` pure -> matches AGENTS.md constants vs utils split (MTV-6959, PR#3027, 2026-10-14)

- [Implementation] Chained `.filter().filter()` on one array -> prefer single `.reduce()` when partitioning in one pass (MTV-6959, PR#3027, 2026-10-14)

## Superseded

*(Lessons replaced by newer, more accurate lessons are moved here with `[Superseded by MTV-XXXX]`.)*
