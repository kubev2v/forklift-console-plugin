<!---
Thanks for creating a Pull Request 💖!

Please read the following before submitting:
- PRs that adds new external dependencies might take a while to review.
- Keep your PR as small as possible.
- Limit your PR to one type (feature, refactoring, ci, or bugfix)
-->

## 📝 Links

<!---
> References: <Jira ticket urls>

> Add more JIRA, Docs, and other PR/Issue links
-->

## 📝 Description

<!---
> Add a brief description
-->

## 🎥 Demo

<!---
> Please add a video or an image of the behavior/changes
-->

## 📝 CC://

<!---
> @tag as needed
-->

---

<details>
<summary>Merge automation commands</summary>

| Command | Description |
|---------|-------------|
| `/lgtm` or `/approve` | Add the `approved` label — PR will auto-merge when all checks pass |
| `/retest` | Re-trigger **Konflux** pipelines (handled by Pipelines as Code) |
| `/retest-gh` | Re-run **failed** GitHub Actions jobs |
| `/retest-gh-all` | Re-run **all** GitHub Actions workflows from scratch |
| `/retest-all` | Re-run failed GitHub Actions jobs **+** Konflux pipelines |
| `/hold` | Prevent auto-merge even if approved and checks pass |
| `/unhold` | Remove the hold and allow auto-merge again |

Submitting a **GitHub review approval** (Approve) also adds the `approved` label.

When checks fail on an approved PR, the bot automatically retries failed GitHub Actions up to **3 times**.
Konflux pipeline failures require a manual `/retest` to re-trigger.
</details>
