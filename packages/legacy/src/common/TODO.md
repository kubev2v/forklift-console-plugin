# TODO: Assess what should be moved to a common repo

The components and utilities in this @app/common directory may be candidates to be moved to a common module that can be reused in multiple konveyor UIs.

The following stuff is duplicated from mig-ui for now:

- Forked from mig-ui version 03f2dd27df7ce23519a5950bb4aa41b9c78f5023:

  - FilterToolbar
  - TableEmptyState
  - useFilterState, usePaginationState, useSortState

- Forked from mig-ui version 948f253baca03445d91bb28f9d9e616959b24fa1

  - SimpleSelect

- Forked from mig-ui version d20a8856ef4a90f16ae1fc541596dd9bcffeec65

  - StatusIcon

When it's time to move those things to a common module, we should check for any changes in mig-ui since those commits.
