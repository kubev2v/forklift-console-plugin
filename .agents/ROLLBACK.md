# Agent setup migration rollback

The complete pre-migration snapshot is kept locally at
.cursor/migration-backup/2026-10-15-pre-migration/ and is ignored by Git. It
contains the original rules/ and skills/ trees, including the local
dev-helper clone, its Git metadata, and its pre-existing uncommitted edits.
Do not delete this backup until the new setup has been accepted.

## Path map

- Every .cursor/rules/<relative>.mdc body and metadata maps to
  .agents/rules/<relative>.md; the old path is now a generated Cursor wrapper.
- Shared skills map from .cursor/skills/<name>/ to
  .agents/skills/<name>/.
- Former personal skills map to the new tracked names recorded in
  migration-manifest.json; their original local folders and config are kept in
  the snapshot, while sanitized reusable copies are tracked under the new names.
- The local dev-helper clone now lives at .agents/skills/dev-helper/; its
  snapshot copy remains under the backup tree.

## Safe rollback procedure

1. Stop Cursor and Codex sessions using this checkout.
2. Review migration-manifest.json. Compare canonical rules with their
   pre-migration sources and check that wrappers match canonical metadata with
   `npm run agent-rules:generate -- --check`. For example:
   `diff -u .cursor/migration-backup/2026-10-15-pre-migration/rules/react-components.mdc .agents/rules/react-components.md`.
3. Before restoring any path, determine whether the active copy changed since
   migration. For tracked files, inspect `git diff`; for ignored/local data,
   compare with the snapshot and recorded pre-migration state. If a change
   cannot confidently be classified as a migration rewrite, preserve both
   versions in a separate recovery location and flag the conflict. Never
   overwrite a changed active copy or modify/delete the snapshot.
4. Restore rules and skills individually from the snapshot only after the
   corresponding active copy is confirmed safe to replace. Original Cursor
   rules must replace generated wrappers only when those wrappers have no
   independent edits. For the local dev-helper, prefer moving the live clone
   back so its current branch and local edits remain intact; keep the snapshot
   clone as a second recovery point. Do not use a blanket copy over either tree.
5. Remove only the migration-added .agents/rules/, generated Codex selector
   skill, .codex/agents/, and .codex/config.toml after confirming their
   contents have no post-migration changes. If they have changed, preserve them.
6. Remove the Codex-only routing paragraph from AGENTS.md and restore only
   migration-edited path references from the manifest. Keep the .gitignore
   protections for local data and backups, as requested.

Rollback does not delete backups or personal data. No Jira, GitHub, Memsource,
PR, or ticket actions are part of rollback.
