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
| `/retest-gh` | Re-run failed **GitHub Actions** workflows and reset the retry counter |
| `/retest-all` | Re-trigger **both** Konflux pipelines and GitHub Actions workflows |
| `/hold` | Prevent auto-merge even if approved and checks pass |
| `/unhold` | Remove the hold and allow auto-merge again |

Submitting a **GitHub review approval** (Approve) also adds the `approved` label.

When checks fail, the bot will automatically retry GitHub Actions up to **3 times** before giving up.
Konflux pipeline failures require a manual `/retest` to re-trigger.
</details>
