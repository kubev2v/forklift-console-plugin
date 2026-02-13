# Claude.md - AI Assistant Guidelines for Forklift Console Plugin

## Project Overview

This is an **OpenShift Console dynamic plugin** for [Forklift](https://github.com/kubev2v/forklift) (Migration Toolkit for Virtualization). It provides a web-based UI inside OpenShift console for migrating VMs from oVirt, VMware, and OpenStack to OpenShift Virtualization.

### Tech Stack
- **React 17** with **TypeScript** (strict mode)
- **PatternFly 6** for UI components
- **i18next** for internationalization
- **react-hook-form** for form handling
- **Jest** for unit testing, **Playwright** for E2E
- **Webpack** for bundling
- **npm** as package manager

---

## Code Style & Conventions

### TypeScript

1. **Use `type` instead of `interface`** for type definitions:
   ```typescript
   // ✅ Good
   type UserProps = {
     name: string;
     age: number;
   };

   // ❌ Bad
   interface UserProps {
     name: string;
     age: number;
   }
   ```

2. **Type imports**:
   - If **all** imports from a module are types, use `import type`:
     ```typescript
     // ✅ Good - all imports are types
     import type { FC, ReactNode } from 'react';
     import type { UserProps } from './types';
     ```
   - If **some** imports are types and some are values, use inline `type` keyword:
     ```typescript
     // ✅ Good - mixed types and values
     import { type FC, useState, type ReactNode } from 'react';
     ```
   - Never separate type and value imports from the same module:
     ```typescript
     // ❌ Bad - separate imports from same module
     import type { FC } from 'react';
     import { useState } from 'react';
     ```

3. **Strict null checks are enabled** - always handle nullable values properly.

### React

1. **Never use default or star imports for React**:
   ```typescript
   // ✅ Good
   import { useState, useEffect, type FC } from 'react';

   // ❌ Bad
   import React from 'react';
   import * as React from 'react';
   ```

2. **Use functional components with `FC` type**:
   ```typescript
   const MyComponent: FC<MyComponentProps> = ({ prop1, prop2 }) => {
     return <div>{prop1}</div>;
   };
   ```

3. **Export components as default at the end of the file** (for component files).

### PatternFly Components

1. **Use `ButtonVariant` enum** instead of string literals:
   ```typescript
   // ✅ Good
   <Button variant={ButtonVariant.primary}>Click</Button>

   // ❌ Bad
   <Button variant="primary">Click</Button>
   ```

2. **Use the custom Select component** from `@components/common/Select` for consistency, not the PatternFly Select directly.

3. Refer to [PatternFly documentation](https://www.patternfly.org/) for component usage.

### Naming & Props

1. **Use `testId` prop** for test identifiers (not `dataTestId`):
   ```typescript
   // ✅ Good
   <Component testId="my-component" />

   // ❌ Bad
   <Component dataTestId="my-component" />
   ```

2. **Use camelCase** for variables and functions.

3. **Use PascalCase** for components and types.

### Utilities

1. **Use `isEmpty()` helper** instead of manual length checks:
   ```typescript
   // ✅ Good
   import { isEmpty } from '@utils/helpers';
   if (isEmpty(array)) { ... }
   if (!isEmpty(object)) { ... }

   // ❌ Bad
   if (array.length === 0) { ... }
   if (Object.keys(obj).length > 0) { ... }
   if (!items.length) { ... }
   ```

---

## Team Best Practices

### React Best Practices

#### File Extensions
- **Components**: Use `.tsx` for all components. **One component per file. No nested components.**
- **Logic/Utility Files**: Use `.ts` for non-component files containing logic or utilities.

#### Component Naming
- Use **PascalCase** for all component names (e.g., `HeaderTop.tsx`).

#### Folder and File Structure
- **Folder Naming**: Use lowercase, **kebab-case** (e.g., `/components/main-header/`).
- **Component Structure**:
  ```
  /components/my-component/
  /components/my-component/components/
  /components/my-component/utils/
  /components/my-component/hooks/
  ```

#### Styling
- **Prefer SCSS** for styling to leverage nesting, variables, and mixins for maintainable styles.
- **Extract styling logic** into SCSS files (`my-component-name.scss`) rather than embedding styles within components.
- **Use project-based class names** on components as the anchor for the rules. It is unsafe to rely on PatternFly class names as they tend to change between versions.

#### Functional Components
- Functional components are the **default**. Use class components only for specific lifecycle methods unavailable in functional components (e.g., `componentDidCatch`).

#### Logic Separation
- **Extract as much logic as possible** from components into custom hooks or utility files. It is much easier to unit test a hook or a utility function.
- Avoid bloated components by delegating logic to external modules.

#### Exports
- Use **default exports** for all components.

#### Component Testing
- Use **Playwright** for end-to-end (E2E) testing.
- Aim for comprehensive test coverage/UI coverage.

#### File and Function Length
- **File Length**: Keep files under **150 lines** whenever possible.
- **Function Length**: Functions should focus on a single responsibility and be easily understood.

#### Performance Optimization
- Use React's memoization tools (`React.memo`, `useMemo`, `useCallback`) to avoid unnecessary re-renders.
- Lazy load components with `React.lazy` and `Suspense`.

#### Hooks
- **Specify Dependencies**: Always specify dependencies in `useEffect` to avoid unnecessary re-renders or missed updates. If no dependencies are required, pass an empty array `[]` to run the effect only once.
- **Logic in Hooks**: Hooks should contain only logic and side effects, **not return JSX**. Keep the JSX in the components, while hooks should be used for extracting reusable or unit-testable logic (e.g., API calls, data transformation, form handling).

---

### JavaScript & TypeScript Best Practices

#### Constants
- Define constants in utility files with **UPPERCASE_UNDERSCORE_SEPARATED** naming:
  ```typescript
  // ✅ Good
  const API_URL = 'https://api.example.com';
  const MAX_RETRY_COUNT = 3;

  // ❌ Bad
  const apiUrl = 'https://api.example.com';
  const maxRetryCount = 3;
  ```

#### Naming Conventions
- Use **descriptive names** for variables, functions, and components.
- **Avoid abbreviations** unless widely recognized.
  ```typescript
  // ✅ Good
  fetchUserData()
  calculateTotalPrice()

  // ❌ Bad
  getData()
  calcPrice()
  ```

#### Functions
- Keep functions **short and focused on one action**.
- Apply **Red → Green → Refactor**:
  1. Write a failing (red) solution.
  2. Implement a working (green) solution.
  3. Refactor for readability and performance.

#### TypeScript Types
- Prefer using `type` instead of `interface` for defining the shapes of objects or functions.
- If a type is exported, **add it to a utility file**.
- **Avoid `any` type**: Always try to avoid using `any` type in TypeScript as it compromises type safety. Use `unknown` instead, and narrow the type as needed:
  ```typescript
  // ✅ Good
  const processData = (data: unknown): string => {
    if (typeof data === 'string') {
      return data.toUpperCase();
    }
    return String(data);
  };

  // ❌ Bad
  const processData = (data: any): string => {
    return data.toUpperCase();
  };
  ```
- **Always explicitly define return types** for functions rather than relying on TypeScript to infer them from the implementation. This helps minimize errors, especially during bug fixes:
  ```typescript
  // ✅ Good
  const calculateTotal = (items: Item[]): number => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  // ❌ Bad (relies on inference)
  const calculateTotal = (items: Item[]) => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };
  ```

#### Avoid Magic Numbers
- Avoid hardcoded values (magic numbers) and define them as constants for easy adjustments and readability:
  ```typescript
  // ✅ Good
  const MAX_ITEMS_PER_PAGE = 25;
  const TIMEOUT_MS = 5000;

  if (items.length > MAX_ITEMS_PER_PAGE) { ... }
  setTimeout(callback, TIMEOUT_MS);

  // ❌ Bad
  if (items.length > 25) { ... }
  setTimeout(callback, 5000);
  ```

---

### CSS/SCSS Best Practices

#### Styling Guidelines
- **Prefer SCSS** for styling to utilize features like nesting, variables, and mixins.
- **Extract styling into separate files** for better organization.

#### General Principles
- Follow the **BEM methodology** for consistent and predictable class naming:
  ```scss
  // Block
  .my-component { ... }

  // Element
  .my-component__header { ... }
  .my-component__content { ... }

  // Modifier
  .my-component--active { ... }
  .my-component__header--highlighted { ... }
  ```
- Use **responsive design principles**: Relative units (`%`, `em`, `rem`) over absolute units (`px`).

#### Avoid `!important`
- **Do not use `!important`** in your SCSS unless absolutely necessary. It makes the code harder to maintain and debug.

---

### Code Quality & Maintainability

#### Comments
- **Avoid comments whenever possible**; write self-explanatory code.
- Use comments sparingly for unusual values or decisions, and **explain the rationale**:
  ```typescript
  // ✅ Good - explains WHY
  // Using 1.5x multiplier to account for timezone edge cases
  const bufferTime = baseTime * 1.5;

  // ❌ Bad - explains WHAT (obvious from code)
  // Multiply baseTime by 1.5
  const bufferTime = baseTime * 1.5;
  ```

#### Global/Store State
- Keep the **global state minimal** and straightforward.
- Obtain **approval in the PR** to add new values to prevent bloating.

#### Avoid Circular Dependencies
- Avoid situations that can lead to circular dependencies.

#### No Barrel Files
- **Do not use `index.ts` barrel files**. Import directly from the source file:
  ```typescript
  // ✅ Good
  import { MyComponent } from './components/MyComponent/MyComponent';
  import { useMyHook } from './hooks/useMyHook';

  // ❌ Bad
  import { MyComponent } from './components';
  import { useMyHook } from './hooks';
  ```

#### Collaboration and Documentation
- Encourage clear communication and documentation of guidelines.

#### Linting and Formatting
- Use **ESLint** (with React and TypeScript plugins) and **Prettier** for consistent formatting and linting.
- Use **Husky** to run linters before commits - **don't skip it**. The `lint-staged` package makes this easy and configurable.

---

## File Organization

### Path Aliases
Use these configured path aliases:
- `@utils/*` → `./src/utils/*`
- `@components/*` → `./src/components/*`
- `@test-utils/*` → `./src/test-utils/*`
- `src/*` → `./src/*`

### Import Order
Imports should be sorted in this order (auto-fixed by ESLint):
1. Node built-ins
2. React, then external packages
3. Path aliases (`@components`, `@utils`, etc.)
4. Type imports
5. Relative imports (parent directories first)
6. Same directory imports
7. Style imports (`.css`, `.scss`)

### File Size Limits
- **Max 300 lines per file** (excluding comments and blank lines)
- **Max 150 lines per function**
- **Max 5 parameters per function**

### Directory Structure
```
src/
├── components/          # Shared/reusable components
│   ├── common/          # Generic UI components
│   └── [Feature]/       # Feature-specific components
├── modules/             # Feature modules
├── providers/           # Provider-related pages (feature)
├── plans/               # Plan-related pages (feature)
├── networkMaps/         # Network mapping pages (feature)
├── storageMaps/         # Storage mapping pages (feature)
├── overview/            # Overview/dashboard pages (feature)
├── utils/               # Shared utility functions
└── test-utils/          # Testing utilities
```

### Dependency Flow (Critical)

**Shared code must NEVER import from feature-specific code.**

The dependency flow is always: `feature → shared → external libraries`

```
┌─────────────────────────────────────────────────────────────┐
│  Feature Code (providers/, plans/, storageMaps/, etc.)      │
│  ↓ can import from                                          │
├─────────────────────────────────────────────────────────────┤
│  Shared Code (components/, utils/)                          │
│  ↓ can import from                                          │
├─────────────────────────────────────────────────────────────┤
│  External Libraries (@patternfly, react, etc.)              │
└─────────────────────────────────────────────────────────────┘
```

```typescript
// ✅ Good - Feature imports from shared
// In: src/plans/components/PlanDetails.tsx
import { LoadingSuspend } from '@components/LoadingSuspend';
import { isEmpty } from '@utils/helpers';

// ❌ Bad - Shared imports from feature
// In: src/components/common/SomeComponent.tsx
import { PlanStatus } from 'src/plans/utils/planStatus'; // NEVER DO THIS
```

---

## Internationalization (i18n)

This project uses `react-i18next` with a custom namespace `plugin__forklift-console-plugin`. Three translation utilities are available from `src/utils/i18n`:

### 1. `useForkliftTranslation` Hook (Primary - Use in Components)

Use this hook inside React components. It returns the `t` function bound to the correct namespace:

```typescript
import { useForkliftTranslation } from 'src/utils/i18n';

const MyComponent: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <div>
      <h1>{t('Page title')}</h1>
      <p>{t('Description text')}</p>
    </div>
  );
};
```

### 2. `ForkliftTrans` Component (For Complex JSX with Interpolation)

Use when you need to embed JSX elements (links, bold text, variables) within translated strings:

```typescript
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

const MyComponent: FC<{ namespace: string }> = ({ namespace }) => {
  return (
    <ForkliftTrans>
      No storage maps found in project <strong>{namespace}</strong>.
    </ForkliftTrans>
  );
};

// For links within translated text:
<ForkliftTrans>
  Migration storage maps are used to map source storages to OpenShift Virtualization.{' '}
  <ExternalLink href={DOCS_URL} isInline>Learn more</ExternalLink>.
</ForkliftTrans>
```

### 3. `t` Function (For Non-Component Code)

Use this **only** outside of React components (utility functions, constants, etc.):

```typescript
import { t } from 'src/utils/i18n';

// In a utility file or outside component scope
const ERROR_MESSAGES = {
  notFound: t('Resource not found'),
  unauthorized: t('You are not authorized to perform this action'),
};
```

### Translation with Variables

Use interpolation for dynamic values:

```typescript
const { t } = useForkliftTranslation();

// Simple interpolation
t('{{count}} items selected', { count: 5 })

// Pluralization (uses _one, _other suffixes in locale file)
t('{{count}} plan', { count: planCount })  // "1 plan" or "5 plans"

// Multiple variables
t('{{completed}} of {{total}} {{name}}', { completed: 3, total: 10, name: 'tasks' })
```

### When to Use Which

| Scenario | Use |
|----------|-----|
| Simple text in components | `useForkliftTranslation` → `t('text')` |
| Text with embedded JSX/links | `<ForkliftTrans>text with <Link>...</Link></ForkliftTrans>` |
| Text with bold/italic parts | `<ForkliftTrans>text with <strong>bold</strong></ForkliftTrans>` |
| Dynamic values | `t('Hello {{name}}', { name })` |
| Outside components | `import { t } from 'src/utils/i18n'` |

### Updating Translations

Run this command to extract new translation keys to locale files:

```bash
npm run i18n
```

Translation files are located in `locales/en/plugin__forklift-console-plugin.json`.

---

## Testing

### Unit Tests (Jest)
- Test files: `*.test.ts` or `*.test.tsx`
- Use `@testing-library/react` for component tests
- Mock i18n with utilities from `@test-utils/mockI18n`

### E2E Tests (Playwright)
- Located in `testing/playwright/e2e/`
- Use page objects from `testing/playwright/page-objects/`

### Run Tests
```bash
npm test                   # Run unit tests
npm run test:coverage      # Run with coverage
npm run test:e2e           # Run E2E tests
```

---

## Commit Message Format

**All commits must include a `Resolves:` line** in the commit description:

### Format Options
```bash
# Single issue
Resolves: MTV-123

# Multiple issues (pick ONE separator style)
Resolves: MTV-123 MTV-456          # space-separated
Resolves: MTV-123, MTV-456         # comma-separated
Resolves: MTV-123 and MTV-456      # and-separated

# With description
Resolves: MTV-123 | Brief description

# No associated ticket
Resolves: None
```

### Example
```
Fix authentication validation bug

Updated login validation to handle edge cases.
Added proper error messages for invalid inputs.

Resolves: MTV-456
```

### Validate Locally
```bash
npm run validate-commits              # Validate latest commit
npm run validate-commits-range "HEAD~5..HEAD"  # Validate range
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Linting
npm run lint              # Check for issues
npm run lint:fix          # Auto-fix issues

# Testing
npm test                  # Unit tests
npm run test:e2e          # E2E tests

# Start local OpenShift console
npm run console           # Start console (background)
npm run console:stop      # Stop console

# Local cluster management
npm run cluster:up        # Setup KinD cluster with Forklift
npm run cluster:delete    # Delete cluster
```

---

## ESLint Rules to Remember

1. **No `console.log`** - use proper logging or remove before commit
2. **Objects must be alphabetically sorted** by keys
3. **No unused variables** (enforced by TypeScript)
4. **Exhaustive deps** for `useEffect`, `useMemo`, `useCallback`
5. **Only export components from component files** (`react-refresh/only-export-components`)
6. **Use `??` instead of `||`** for default values with strings/numbers to avoid falsy value issues:
   ```typescript
   // ✅ Good
   const name = value ?? DEFAULT_NAME;
   
   // ❌ Bad
   const name = value || DEFAULT_NAME;
   ```

---

## Common Patterns

### Loading States
```typescript
import LoadingSuspend from '@components/LoadingSuspend';

<LoadingSuspend obj={data} loaded={loaded} loadError={error}>
  <MyContent data={data} />
</LoadingSuspend>
```

### Forms with react-hook-form
```typescript
import { useForm, FormProvider } from 'react-hook-form';

const { control, handleSubmit } = useForm<FormValues>();
```

### Kubernetes Resources
Use hooks from `@openshift-console/dynamic-plugin-sdk`:
```typescript
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const [data, loaded, error] = useK8sWatchResource<Resource>({
  groupVersionKind: { group, version, kind },
  isList: true,
});
```

---

## Additional Resources

- [Forklift Repository](https://github.com/kubev2v/forklift/)
- [OpenShift Console](https://github.com/openshift/console)
- [PatternFly Documentation](https://www.patternfly.org/)
- [OpenShift Dynamic Plugin SDK](https://github.com/openshift/dynamic-plugin-sdk)

