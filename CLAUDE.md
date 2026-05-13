# Forklift Console Plugin

OpenShift Console dynamic plugin for [Forklift](https://github.com/kubev2v/forklift) (Migration Toolkit for Virtualization). Migrates VMs from vSphere, oVirt, OpenStack, Hyper-V, OVA, and EC2 to OpenShift Virtualization.

## Context Files

- [AGENTS.md](AGENTS.md) -- coding standards, conventions, patterns, directory structure
- [ARCHITECTURE.md](ARCHITECTURE.md) -- system design, CRDs, data flow, build pipeline
- [CONTRIBUTING.md](CONTRIBUTING.md) -- PR process, branching, testing requirements
- [COMMIT_MESSAGE_GUIDE.md](COMMIT_MESSAGE_GUIDE.md) -- commit format (`Resolves: MTV-1234`, signed-off)
- [docs/architecture.md](docs/architecture.md) -- detailed CRD relationships and migration flow

## Quick Reference

- **Stack**: React 17, TypeScript (strict), PatternFly 6, react-hook-form, react-i18next, Webpack
- **Path aliases**: `@utils/*`, `@components/*`, `@test-utils/*`, `src/*`
- **Lint**: `npm run lint` (ESLint flat config + Stylelint + cspell). Auto-fix: `npm run lint:fix`
- **Test**: `npm test` (Jest). E2E: `npm run test:e2e` (Playwright)
- **Build**: `npm run build`
- **i18n**: `npm run i18n` (never edit locale JSON directly)
- **Commit validation**: `npm run validate-commits`

## Key Rules

Complete coding standards and conventions are in [AGENTS.md](AGENTS.md). Key rules summarized here:

- Shared code (`components/`, `utils/`) must never import from feature code
- One component per file, default export, `.tsx` extension
- File limit: 300 lines, function limit: 150 lines (excluding blanks/comments)
- Use `type` not `interface`; inline `type` keyword for mixed imports
- Use `useForkliftTranslation` hook in components, `ForkliftTrans` for JSX interpolation
- Use custom `Select` from `@components/common/Select`, not PatternFly's directly
- Use `ButtonVariant` enum, not string literals
- Use `isEmpty()` from `@utils/helpers`, not manual `.length` checks
- All commits: `git commit -s` + `Resolves:` line (see [COMMIT_MESSAGE_GUIDE.md](COMMIT_MESSAGE_GUIDE.md))
