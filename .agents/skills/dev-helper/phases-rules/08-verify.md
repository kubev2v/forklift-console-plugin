# Forklift: Verification Rules

## Split: AI writes / human runs
- Unit tests are **written** in implement (P7).
- **Human** runs `npm test` (or scoped pattern) and pastes output.
- On failure, a fix subagent gets the pasted log only — no long auto-retry loop.

## Testing Patterns
Follow `AGENTS.md` testing section and `.agents/rules/testing.md` patterns:

- Test files: `*.test.ts` or `*.test.tsx`
- Place in `__tests__/` folder adjacent to the source file
- Use `@testing-library/react` for component/hook tests
- Mock i18n with utilities from `@test-utils/mockI18n`

## Personas
- Prefer **QE** (+ Developer) when writing or fixing tests.
- `clear` tickets: Developer + QE only (no Architect/UX/Expert required).
