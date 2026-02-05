# Bug Investigation Workflow

Use this workflow when given a Jira bug ticket to investigate and fix.

## Phase 1: Understand the Issue

1. Use `get_jira` tool to fetch the ticket details by key (e.g., MTV-1885)
2. Use `get_issue_comments` to read any additional context from the team
3. Identify key information:
   - Affected version
   - Steps to reproduce
   - Expected vs actual behavior
   - Any attached logs, YAMLs, or screenshots

## Phase 2: Investigate the Codebase

1. Based on the bug description, identify likely affected areas:
   - Component mentioned in the ticket
   - Error messages that can be searched
   - UI elements or API endpoints involved
2. Search the codebase for related code
3. Trace the code flow that would be executed during reproduction steps
4. Identify the root cause

## Phase 3: Present Analysis

Present findings to the user:
- **Root Cause**: Clear explanation of why the bug occurs
- **Affected Files**: List of files that need modification
- **Solution Options**: Provide 2-3 possible approaches with tradeoffs:
  - Option A: [Quick fix] - Description and implications
  - Option B: [Proper fix] - Description and implications  
  - Option C: [Comprehensive fix] - If applicable

## Phase 4: Implementation (after user selects approach)

1. Implement the selected fix
2. Follow project coding conventions
3. Add appropriate error handling if needed
4. Consider edge cases

## Phase 5: Testing (ASK USER BEFORE PROCEEDING)

**IMPORTANT**: Before writing any tests, ASK the user which testing approach they prefer:

> "What testing approach would you like for this fix?"
> - **A) Unit tests** - Create tests in `__tests__` folder next to the modified file
> - **B) E2E tests** - Create/update tests in the `testing/` folder
> - **C) No tests** - Skip testing (already covered by existing tests or testing would be overkill)

### If Unit Tests (Option A):
1. Create test file in `__tests__` folder adjacent to the modified file
2. Test the specific logic that was fixed
3. Include a test case that demonstrates the old buggy behavior
4. Run tests: `npm test <path-to-test-file>`

### If E2E Tests (Option B):
1. Create/update tests in `testing/` folder
2. Follow existing E2E test patterns in the project
3. Run E2E tests: `npm run test:e2e`

### If No Tests (Option C):
1. Document why tests are not needed in the PR description
2. Reference existing tests that cover this functionality (if applicable)

## Phase 6: Create PR

1. Create a feature branch:
   ```bash
   git checkout -b fix/MTV-XXXX-brief-description
   ```

2. Stage and commit with the project's commit format:
   ```bash
   git add .
   git commit -s -m "Resolves: MTV-XXXX | Brief description of the fix"
   ```
   
   **Important**: 
   - Always use `-s` flag for sign-off
   - If no Jira ticket: `Resolves: None`

3. Create copyable PR description using the GitHub template format:

```markdown
## 📝 Links

> References: https://issues.redhat.com/browse/MTV-XXXX

> Related: [Add related tickets/PRs if any]

## 📝 Description

[Brief description of the fix]

**Root Cause:** [Clear explanation of why the bug occurs]

**Fix:** [What was changed to fix it]

## 🎥 Demo

[Add screenshot/video showing the fix, or describe manual verification steps]

## 📝 CC://

[Tag reviewers if needed]
```
