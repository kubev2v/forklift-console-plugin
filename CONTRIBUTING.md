# Contributing to Forklift Console Plugin

Thank you for your interest in contributing to the Forklift Console Plugin. This guide covers the conventions, processes, and standards the team follows.

For initial setup (clone, install, run), see [README.md](README.md#quick-start).

## Branching Strategy

Development happens on `main`. Release branches follow the pattern `release-X.Y` (e.g., `release-2.11`, `release-2.10`).

- **Feature branches**: fork from `main`, open a PR against `main`
- **Release branches**: cut from `main` when a release stabilizes
- **Backports**: after a PR merges to `main`, comment `/backport release-X.Y` on the PR to create a cherry-pick PR to that release branch. `/cherrypick` and `/cherry-pick` also work. Add `--dry-run` to test first.

## Pull Request Process

1. **Fork and branch** -- fork the repo, create a feature branch from `main`
2. **Keep PRs focused** -- one logical change per PR. Smaller PRs get faster reviews.
3. **Ensure CI passes** -- every PR runs linters (ESLint, Stylelint, Knip), build, unit tests (Jest with coverage via Codecov), and upstream E2E tests (Playwright)
4. **Request review** -- PRs require at least one approval from a project member
5. **Squash merge** -- PRs are squash-merged into `main`

### CI Checks on Every PR

| Check | What it runs |
|---|---|
| Linters | `npm run lint`, `npm run test:i18n`, `npm run knip` |
| Build | `npm run build` |
| Tests + Coverage | `npm run test:coverage` (uploaded to Codecov) |
| E2E | Playwright upstream tests against a KinD cluster |
| Commit validation | Validates `Resolves:` line format in commit messages |

## Commit Conventions

All commits must be **signed off** (`git commit -s`) for DCO compliance. The DCO check fails without the `Signed-off-by` line.

Every commit message must include a `Resolves:` line in the body. For the full format specification, examples, and troubleshooting, see [COMMIT_MESSAGE_GUIDE.md](COMMIT_MESSAGE_GUIDE.md).

Quick reference:

```text
Fix provider validation for vSphere

Updated certificate handling for edge cases.

Resolves: MTV-456
Signed-off-by: Your Name <your-email@redhat.com>
```

Validate locally before pushing:

```bash
npm run validate-commits
```

## Coding Standards

The project follows strict conventions documented in [AGENTS.md](AGENTS.md). Here is a summary of the most important rules:

### TypeScript

- **Strict mode** is enabled -- always handle nullable values
- Use `type` instead of `interface` for type definitions
- Use inline `type` keyword for mixed imports: `import { type FC, useState } from 'react'`
- Never use `any` -- use `unknown` and narrow the type
- Always define explicit return types on functions
- Use `??` instead of `||` for default values

### React

- Never use default or star imports for React (`import React from 'react'` is wrong)
- Use `FC` type for functional components
- One component per file, default export at end of file
- Extract logic into custom hooks or utility files -- keep components lean
- Use `testId` prop (not `dataTestId`) for test identifiers

### PatternFly

- Use PatternFly 6 components
- Use enum variants (`ButtonVariant.primary`) instead of string literals (`"primary"`)
- Use the custom `Select` component from `@components/common/Select`, not PatternFly's directly

### File Organization

- Components: `.tsx` extension, PascalCase filename (e.g., `MyComponent.tsx`)
- Folders: lowercase kebab-case (e.g., `my-component/`)
- No barrel files (`index.ts`) -- import directly from source files
- Path aliases: `@utils/*`, `@components/*`, `@test-utils/*`, `src/*`
- Target file size: under 150 lines, hard limit 300 lines

### Styling

- Prefer SCSS with BEM methodology
- Extract styles into separate `.scss` files
- Use project-based class names, not PatternFly class names (they change between versions)
- No `!important`

## Internationalization

All user-facing strings must be translatable. The project uses `react-i18next` with namespace `plugin__forklift-console-plugin`.

- In components: `useForkliftTranslation` hook
- For JSX interpolation: `<ForkliftTrans>` component
- Outside components: `t` function from `src/utils/i18n`

After adding new strings, run `npm run i18n` to extract translation keys.

## Testing

### Unit Tests (Jest)

- Test files: `*.test.ts` or `*.test.tsx`
- Use `@testing-library/react` for component tests
- Run: `npm test` or `npm run test:coverage`

### E2E Tests (Playwright)

- Located in `testing/playwright/e2e/`
- Page objects in `testing/playwright/page-objects/`
- Upstream tests run in CI against a KinD cluster
- Downstream tests run against real OpenShift clusters with providers
- Run: `npm run test:e2e`

## Linting

ESLint and Prettier run automatically via Husky pre-commit hooks (`lint-staged`). Do not skip them.

Key ESLint rules:

- No `console.log` -- remove before committing
- Objects must have alphabetically sorted keys
- Exhaustive deps for `useEffect`, `useMemo`, `useCallback`
- Imports auto-sorted by ESLint

```bash
npm run lint        # check for issues
npm run lint:fix    # auto-fix
```

## Getting Help

- **Jira project**: MTV (tickets are `MTV-XXXX`)
- **Repository**: [kubev2v/forklift-console-plugin](https://github.com/kubev2v/forklift-console-plugin)
- **Forklift ecosystem**: [kubev2v/forklift](https://github.com/kubev2v/forklift) (operator and controllers)
