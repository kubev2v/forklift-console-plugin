# Forklift: Triage Rules

## Backend Dependencies
- Backend repo: kubev2v/forklift (configured in `github.backendRepo`)
- Check linked tickets for backend PRs using: `gh pr view <PR#> --repo $GH_BACKEND_REPO`

## Complexity Classification Examples

### Clear
- Fix typo in i18n key, missing null check, PatternFly enum update
- Add a new provider type (12-step checklist in `.agents/rules/frontend/providers.md`)
- Add a field to storage map details (known pattern: field + component + i18n)
- CSS/SCSS alignment tweak

### Complicated
- Plan status logic bug (trace `getPlanStatus` evaluation order)
- NetworkMap validation doesn't catch duplicates (trace form vs submit vs API)
- New field plumbing across data flow (StorageMap, Plan wizard, details tab)
- Performance regression in table rendering (need to profile)

### Complex
- New CRD support (e.g., Conversion/Inspection UX — unfamiliar CRD)
- Redesign plan wizard for new migration type (which steps apply is unclear)
- Integrate with a new external system where the API contract is evolving
