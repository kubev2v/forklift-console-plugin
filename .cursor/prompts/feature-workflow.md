# Feature Implementation Workflow

Use this workflow when given a Jira feature ticket to implement.

## Phase 1: Understand Requirements

1. Use `get_jira` tool to fetch the ticket details by key
2. Use `get_issue_comments` to read any additional context or discussions
3. Identify key information:
   - User story (As a... I want... So that...)
   - Acceptance criteria (checklist of requirements)
   - Technical requirements or constraints
   - Any attached mockups, designs, or API specs

## Phase 2: Analyze Impact

1. Identify affected areas of the codebase:
   - Components to create or modify
   - State management changes
   - API integrations needed
   - Styling requirements
2. Check for related existing code that can be reused
3. Identify potential dependencies or blockers

## Phase 3: Propose Implementation

Present implementation plan to the user:
- **Approach**: High-level description of the implementation
- **Files to Create**: New files needed
- **Files to Modify**: Existing files to change
- **Components**: UI components to build
- **Estimated Complexity**: Simple/Medium/Complex

Ask user to confirm before proceeding.

## Phase 4: Implementation

1. Follow project structure and conventions
2. Create components with proper TypeScript types
3. Follow existing patterns in the codebase
4. Ensure responsive design if UI-related
5. Add appropriate loading/error states

## Phase 5: Testing (ASK USER BEFORE PROCEEDING)

**IMPORTANT**: Before writing any tests, ASK the user which testing approach they prefer:

> "What testing approach would you like for this feature?"
> - **A) Unit tests** - Create tests in `__tests__` folder next to the new/modified files
> - **B) E2E tests** - Create/update tests in the `testing/` folder
> - **C) No tests** - Skip testing (already covered by existing tests or testing would be overkill)

### If Unit Tests (Option A):
1. Create test file in `__tests__` folder adjacent to the component/util
2. Test the new functionality and edge cases
3. Run tests: `npm test <path-to-test-file>`

### If E2E Tests (Option B):
1. Create/update tests in `testing/` folder
2. Follow existing E2E test patterns in the project
3. Test the user flow for the new feature
4. Run E2E tests: `npm run test:e2e`

### If No Tests (Option C):
1. Document why tests are not needed in the PR description
2. Reference existing tests that will cover this functionality (if applicable)

## Phase 6: Create PR

1. Create a feature branch:
   ```bash
   git checkout -b feat/MTV-XXXX-brief-description
   ```

2. Stage and commit with the project's commit format:
   ```bash
   git add .
   git commit -s -m "Resolves: MTV-XXXX | Brief description of the feature

   Resolves: MTV-XXXX"
   ```
   
   **Important**: 
   - Always use `-s` flag for sign-off
   - Include `Resolves: MTV-XXXX` in commit body
   - If no Jira ticket: `Resolves: None`

3. Push to origin:
   ```bash
   git push -u origin feat/MTV-XXXX-brief-description
   ```

4. Create PR using the GitHub template format:

```markdown
## 📝 Links

> References: https://issues.redhat.com/browse/MTV-XXXX

> Related: [Add related tickets/PRs if any]

## 📝 Description

[Brief description of the feature]

**User Story:** [As a... I want... So that...]

**Changes:**
- [List of changes made]

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## 🎥 Demo

[Add screenshot/video showing the new feature]

## 📝 CC://

[Tag reviewers if needed]
```
