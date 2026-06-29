---
description: Rules for taking UI screenshots and screen recordings with MCP tools
alwaysApply: false
---

# Taking Screenshots & Screen Recordings

Rules for capturing UI screenshots (Playwright MCP) and screen recordings
(video-recorder MCP) for PR demos.

---

## 1. Screenshot Location

Save all screenshots to the user's Downloads directory under a ticket-keyed folder:

```
~/Downloads/{TICKET_KEY}/
  MTV-XXXX-1-description.png
  MTV-XXXX-2-description.png
  ...
```

Create the directory if it doesn't exist. Never save screenshots to the project directory.

### PR Image Upload

Use the `gh attach` CLI extension to upload images for PR descriptions:

```bash
# Upload and get the URL
gh attach upload ~/Downloads/{TICKET_KEY}/image.png \
  --target kubev2v/forklift-console-plugin#<PR_NUMBER> \
  --strategy release-asset \
  --format url
```

This produces a GitHub-hosted URL that renders inline in markdown. Use the
returned URL in the PR body as `![description](URL)`.

Images are stored as release assets under the `_gh-attach-assets` tag on the
target repo. The `release-asset` strategy works with `gh auth token` -- no
browser session needed.

---

## 2. File Naming

Format: `{TICKET_KEY}-{index}-{short-description}.png`

- Use the ticket key (e.g., `MTV-2482`)
- Append an incrementing index starting at 1
- Add a brief kebab-case description of what the screenshot shows
- Example: `MTV-2482-1-plan-details-header.png`, `MTV-2482-2-inspect-modal.png`

---

## 3. Browser Setup

Before taking screenshots:
- Resize the browser: `browser_resize -> { width: 1920, height: 1080 }`
- Wait for the page to fully load before capturing
- If the target element is below the fold, scroll to it or use `fullPage: true`
- The 1920x1080 viewport matches a standard monitor; the sidebar uses ~250px
  leaving ~1670px for content. This is acceptable -- do NOT use larger viewports

---

## 4. Ticket-Driven Testing

Before taking **any** screenshots, re-read the Jira ticket. The screenshots must
prove the fix works according to the ticket, not just show UI components exist.

### Preparation

1. Read the ticket's **Steps to Reproduce**, **Actual Results**, and **Expected Results**.
2. Plan screenshots that demonstrate the transition from actual to expected.
3. Follow the ticket's user flow, not the code change list.

### What to capture

- **The outcome described in the ticket.** If the ticket says "plan fails with
  CannotStart," screenshot the plan status showing it now reaches Ready.
- **Resource evidence.** When the fix involves K8s resources (Plans, Maps,
  Providers), screenshot the YAML tab showing the relevant `spec` or `status`
  fields. This proves the backend accepted the resource correctly.
- **Before/after pairs** when reproducing vs. verifying (see sections 6 and 7).

### What NOT to capture

- UI components you touched but the ticket does not mention.
- Wizard steps, dropdowns, or navigation that are intermediate to the outcome.
- Redundant views that look identical to another screenshot.
- Generic page chrome without the relevant feature visible.

---

## 5. What to Screenshot (General)

When screenshots are not tied to a specific ticket (e.g., demos, explorations):

**Do screenshot:**
- Components/features in different states (empty, loading, populated, error)
- Modal dialogs showing the full content
- Expanded sections (scroll to make the added content visible)

**Do NOT screenshot:**
- Intermediate states that don't show the feature (e.g., clicking expand but
  not scrolling to see the expanded content)

---

## 6. Before/After Screenshot Workflow

For bug fixes with visual changes, always capture **before** and **after** pairs
using git stash to toggle between states:

### Step 1: Identify visual changes

Determine if the fix produces any visible UI differences. If purely logic-based
(e.g., validation timing), screenshots may not be meaningful -- skip to section 7.

### Step 2: Map affected components to navigation paths

For each changed file, determine:
- Which UI component renders differently
- The exact page/tab/popover/dropdown where the change is visible
- The navigation steps to reach it (URL + interactions like clicks/hovers)
- Whether the element needs scrolling, expanding, or hovering to be visible
- Whether an interactive state must be triggered (open a dropdown, hover a
  badge, click a popover trigger) to make the changed element appear

Document these as a navigation plan before taking any screenshots.

**Focus on close-ups, not full pages.** If the visual change is subtle (e.g.,
an icon color change), a full-page screenshot will not show it. Instead:
- Open the popover/dropdown/tooltip so the changed element is prominent
- Use element-targeted screenshots (`target` param) when the change is a
  small icon or badge within a larger page
- If only a full-page capture is possible, ensure the changed element is
  in the visible viewport and not buried among irrelevant content

### Step 3: Stash changes (before state)

```bash
git stash push -m "MTV-XXXX: temporarily stash for before screenshots"
```

The dev server will hot-reload to the old code.

### Step 4: Take "before" screenshots

Navigate to each location from Step 2 and capture the old/broken state.
Name files with `before-` prefix:

```
MTV-XXXX-before-1-concerns-popover-info-icon.png
MTV-XXXX-before-2-severity-filter-dropdown.png
```

**Rules:**
- Every "before" MUST have a matching "after" -- never orphan a screenshot
- Open interactive elements (dropdowns, popovers, tooltips) before capturing
- If the change is a color/size/style difference, the affected element must
  be large enough in the screenshot to clearly see the difference
- Do NOT screenshot collapsed/closed states where the changed element is hidden

### Step 5: Pop stash (after state)

```bash
git stash pop
```

The dev server will hot-reload with the fix applied.

### Step 6: Take "after" screenshots

Navigate to the **same locations** and capture the fixed state.
Name files with `after-` prefix:

```
MTV-XXXX-after-1-concerns-popover-info-icon.png
MTV-XXXX-after-2-severity-filter-dropdown.png
```

The before/after pairs should be visually comparable (same viewport, same
page state, same element visible). The set of "after" screenshots must be
an exact mirror of the "before" set -- same count, same navigation paths,
same interactive states opened.

---

## 7. Verifying Fixes (Non-Visual)

When the fix is not visual (e.g., validation logic, data flow), fall back to
functional evidence:

1. Follow the ticket's **Steps to Reproduce** exactly.
2. Screenshot the **expected result** described in the ticket:
   - Plan status shows **Ready** instead of CannotStart
   - Resource YAML shows populated `spec.map` instead of empty `[]`
   - Conditions section has no critical mapping errors
3. Name the file with `verify-` prefix: `MTV-XXXX-verify-1-fixed-validation.png`

---

## 8. Common Console URLs (Reference)

### Local development
- Overview: `http://localhost:9000/mtv/overview`
- Plans (all namespaces): `http://localhost:9000/k8s/all-namespaces/forklift.konveyor.io~v1beta1~Plan`
- Plans (specific namespace): `http://localhost:9000/k8s/ns/{namespace}/forklift.konveyor.io~v1beta1~Plan`
- Providers (all namespaces): `http://localhost:9000/k8s/all-namespaces/forklift.konveyor.io~v1beta1~Provider`
- Providers (specific namespace): `http://localhost:9000/k8s/ns/{namespace}/forklift.konveyor.io~v1beta1~Provider`
- Network maps: `http://localhost:9000/k8s/ns/{namespace}/forklift.konveyor.io~v1beta1~NetworkMap`
- Storage maps: `http://localhost:9000/k8s/ns/{namespace}/forklift.konveyor.io~v1beta1~StorageMap`

### Resource detail pages
- Plan details: `http://localhost:9000/k8s/ns/{namespace}/forklift.konveyor.io~v1beta1~Plan/{name}`
- Provider details: `http://localhost:9000/k8s/ns/{namespace}/forklift.konveyor.io~v1beta1~Provider/{name}`

Replace `localhost:9000` with the cluster console URL when testing against a real cluster.

---

## 9. Common Mistakes to Avoid

1. **Full-page screenshots for subtle changes.** A 1px icon color change is
   invisible in a 1920x1080 full-page capture. Open the popover/dropdown
   and capture just that element or its immediate surroundings.

2. **Orphaned before screenshots.** Every before MUST have an after. If you
   take 3 "before" screenshots, you must take exactly 3 matching "after"
   screenshots at the same locations.

3. **Skipping interactive states.** If the ticket mentions a filter dropdown
   or a hover popover, you must OPEN that dropdown/popover before capturing.
   A closed dropdown shows nothing.

4. **Screenshotting irrelevant views.** If a file you changed renders in a
   table row but the color change is only visible inside a popover triggered
   from that row, screenshot the open popover -- not the table row itself.

5. **Not following the ticket's reproduction steps.** The ticket says where
   the bug is visible. Follow those steps, not your own assumptions about
   where the code change might be visible.

---

## 10. Screen Recordings (video-recorder MCP)

Record PR demo videos for **both bugs and features**. Every PR should have a
recording that shows the changed/added components in action.

### Recording Method

**Write a Playwright script and run it directly.** Do NOT use the video-recorder
MCP tool-by-tool -- each MCP call has agent round-trip latency (seconds per call),
making a 10-step demo take minutes instead of seconds. A Playwright script runs
all steps in one process with precise timing.

### When to Record

- **Bugs**: Record the fixed behavior (the "after" state)
- **Features**: Record the new functionality end-to-end
- **Skip** only when the change has zero visual impact (e.g., internal refactor
  with no UI difference)

### Step 1: Plan the recording script

Before starting the recording, write out the exact steps as a numbered list:

```
Recording plan for MTV-5314:
1. Navigate to NetworkMaps list page
2. Click kebab on first row (wait for dropdown)
3. Click "Edit" (wait for details page to load)
4. Click "Actions" dropdown (wait for menu)
5. Verify "Edit YAML" text visible (pause 1.5s)
6. Click "Edit YAML" (wait for YAML editor to load)
7. Pause 1.5s on YAML editor, then stop
```

This plan ensures you know every selector and wait condition BEFORE starting
the recording, avoiding fumbling or long pauses mid-video.

### Step 2: Verify prerequisites

Before writing the script:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:9000/
```

If the console is not reachable (non-200), ask the user to start it.

### Step 3: Write the Playwright recording script

Create a script at `~/Downloads/{TICKET_KEY}/record-demo.mjs`:

```javascript
import { chromium } from 'playwright';

const CONSOLE_URL = 'http://localhost:9000';
const START_URL = `${CONSOLE_URL}/k8s/...`; // starting page
const OUTPUT_DIR = `${process.env.HOME}/Downloads/{TICKET_KEY}`;
const PAUSE_MS = 1200; // pause between actions for viewer readability

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Playwright recordVideo doesn't capture the real cursor. Inject a red
// dot overlay that follows mouse movements so clicks are visible on video.
// Must be called after every page navigation (DOM resets on navigate).
async function injectFakeCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('fake-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'fake-cursor';
    Object.assign(cursor.style, {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: 'rgba(255, 50, 50, 0.7)',
      border: '2px solid rgba(255, 255, 255, 0.9)',
      position: 'fixed',
      top: '0px',
      left: '0px',
      zIndex: '999999',
      pointerEvents: 'none',
      transition: 'top 0.1s ease-out, left 0.1s ease-out',
      boxShadow: '0 0 6px rgba(0,0,0,0.3)',
    });
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX - 10}px`;
      cursor.style.top = `${e.clientY - 10}px`;
    });
  });
}

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: OUTPUT_DIR, size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();

// 1. Navigate to starting page
await page.goto(START_URL);
await page.waitForSelector('...', { timeout: 15000 });
await injectFakeCursor(page);
await sleep(PAUSE_MS);

// 2-N. Actions from the recording plan
// await page.click('...');
// await page.waitForSelector('...', { timeout: 5000 });
// await injectFakeCursor(page);  // call after each navigation
// await sleep(PAUSE_MS);

await context.close();
await browser.close();
```

**Fake cursor rules:**
- Call `injectFakeCursor(page)` after the initial page load and after every
  navigation that causes a full page reload (the DOM resets, losing the overlay)
- Do NOT call it after clicks that stay on the same page (dropdowns, modals)
- The red dot with white border is visible on both light and dark backgrounds

**Timing rules:**
- `PAUSE_MS = 1200` between actions -- brisk but readable
- Use `waitForSelector` to wait for actual elements, not arbitrary timeouts
- `headless: false` so the browser window is visible during recording
- `recordVideo` captures everything in one shot with no round-trip latency

### Step 4: Set up and run

Ensure playwright is available in the output directory:

```bash
cd ~/Downloads/{TICKET_KEY}
npm init -y && npm install playwright@1.59.1
node record-demo.mjs
```

### Step 5: Convert and clean up

Playwright outputs `.webm`. Convert to `.mp4` for GitHub PR compatibility:

```bash
ffmpeg -i {recording}.webm -c:v libx264 -preset fast -crf 23 \
  {TICKET_KEY}-demo.mp4 -y
```

### Recording Output

```
~/Downloads/{TICKET_KEY}/
  record-demo.mjs          # the script (rerunnable)
  {TICKET_KEY}-demo.mp4    # final recording for PR
```

### Common Recording Mistakes

1. **Using MCP tool-by-tool for recordings.** Each MCP call has seconds of
   agent round-trip latency. A 10-step demo takes minutes via MCP but
   ~12 seconds via a direct Playwright script. Always use a script.

2. **Starting before the console is up.** Verify `localhost:9000` returns
   200 before running the script.

3. **No plan before writing the script.** Write the numbered step list
   first, then translate it to code. This avoids forgetting steps.

4. **Too-long pauses.** 1200ms between actions is enough for a viewer to
   follow. Anything above 2000ms feels sluggish on video.

5. **Not showing the changed component.** The recording must demonstrate
   the actual behavior change, not just navigate to a page.
