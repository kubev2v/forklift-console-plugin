#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_config.sh"

STATE_DIR="$SKILL_DIR/state"
SUMMARIES_DIR="$SKILL_DIR/summaries"
TODAY=$(date +"%Y-%m-%d")
OUTPUT_FILE="$SUMMARIES_DIR/$TODAY.html"

mkdir -p "$SUMMARIES_DIR"

# Collect state data
ACTIVE_TICKETS=()
WAITING_TICKETS=()
DONE_TICKETS=()

for f in "$STATE_DIR"/*/state.json; do
  [[ -f "$f" ]] || continue
  phase=$(jq -r '.phase // "unknown"' "$f")
  is_waiting=$(jq -r '.waiting.active // false' "$f")

  if [[ "$phase" == "done" ]]; then
    DONE_TICKETS+=("$f")
  elif [[ "$is_waiting" == "true" ]]; then
    WAITING_TICKETS+=("$f")
  else
    ACTIVE_TICKETS+=("$f")
  fi
done

TOTAL_ACTIVE=${#ACTIVE_TICKETS[@]}
TOTAL_WAITING=${#WAITING_TICKETS[@]}
TOTAL_DONE=${#DONE_TICKETS[@]}
TOTAL_ALL=$((TOTAL_ACTIVE + TOTAL_WAITING + TOTAL_DONE))

# Count PRs opened (any ticket with a prUrl)
PRS_OPENED=0
for f in "$STATE_DIR"/*/state.json; do
  [[ -f "$f" ]] || continue
  pr_url=$(jq -r '.prUrl // empty' "$f")
  [[ -n "$pr_url" ]] && ((PRS_OPENED++)) || true
done

# Phase-to-color-category mapping
phase_category() {
  case "$1" in
    triage|investigate|reproduce|ask-more-info|jira-track|design)
      echo "planning" ;;
    implement|verify|e2e-test)
      echo "implementation" ;;
    send-pr|monitor-pr)
      echo "pr" ;;
    track-jira-merged)
      echo "post-merge" ;;
    done)
      echo "done" ;;
    *)
      echo "planning" ;;
  esac
}

# Time-ago helper (outputs human-readable duration)
time_ago() {
  local iso_date="$1"
  [[ -z "$iso_date" || "$iso_date" == "null" ]] && echo "unknown" && return

  local then_epoch now_epoch diff_seconds
  then_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$iso_date" +%s 2>/dev/null || date -d "$iso_date" +%s 2>/dev/null || echo "0")
  now_epoch=$(date +%s)

  [[ "$then_epoch" == "0" ]] && echo "unknown" && return

  diff_seconds=$((now_epoch - then_epoch))
  if ((diff_seconds < 3600)); then
    echo "$((diff_seconds / 60))m ago"
  elif ((diff_seconds < 86400)); then
    echo "$((diff_seconds / 3600))h ago"
  else
    echo "$((diff_seconds / 86400))d ago"
  fi
}

# Build HTML active ticket cards
build_active_cards() {
  for f in "${ACTIVE_TICKETS[@]}"; do
    local ticket phase type branch pr_url started_at category time_since
    ticket=$(jq -r '.ticket' "$f")
    phase=$(jq -r '.phase // "unknown"' "$f")
    type=$(jq -r '.type // "Unknown"' "$f")
    branch=$(jq -r '.branch // empty' "$f")
    pr_url=$(jq -r '.prUrl // empty' "$f")
    started_at=$(jq -r '.startedAt // empty' "$f")
    category=$(phase_category "$phase")
    time_since=$(time_ago "$started_at")

    cat <<CARD
      <div class="card">
        <div class="card__header">
          <a class="card__ticket" href="${JIRA_BASE_URL}/browse/${ticket}" target="_blank">${ticket}</a>
          <span class="badge badge--${category}">${phase}</span>
        </div>
        <div class="card__meta">
          <span class="card__type">${type}</span>
          <span class="card__time">Started ${time_since}</span>
        </div>
        ${branch:+<div class="card__branch"><code>${branch}</code></div>}
        ${pr_url:+<div class="card__pr"><a href="${pr_url}" target="_blank">PR ↗</a></div>}
      </div>
CARD
  done
}

# Build HTML waiting ticket cards
build_waiting_cards() {
  for f in "${WAITING_TICKETS[@]}"; do
    local ticket phase reason since pr_url type duration
    ticket=$(jq -r '.ticket' "$f")
    phase=$(jq -r '.phase // "unknown"' "$f")
    reason=$(jq -r '.waiting.reason // "unknown"' "$f")
    since=$(jq -r '.waiting.since // empty' "$f")
    pr_url=$(jq -r '.prUrl // empty' "$f")
    type=$(jq -r '.type // "Unknown"' "$f")
    duration=$(time_ago "$since")

    cat <<CARD
      <div class="card card--waiting">
        <div class="card__header">
          <a class="card__ticket" href="${JIRA_BASE_URL}/browse/${ticket}" target="_blank">${ticket}</a>
          <span class="badge badge--waiting">${reason}</span>
        </div>
        <div class="card__meta">
          <span class="card__type">${type}</span>
          <span class="card__time">Waiting ${duration}</span>
        </div>
        ${pr_url:+<div class="card__pr"><a href="${pr_url}" target="_blank">PR ↗</a></div>}
      </div>
CARD
  done
}

# Build HTML done table rows
build_done_rows() {
  for f in "${DONE_TICKETS[@]}"; do
    local ticket type pr_url merged_at
    ticket=$(jq -r '.ticket' "$f")
    type=$(jq -r '.type // "Unknown"' "$f")
    pr_url=$(jq -r '.prUrl // empty' "$f")
    merged_at=$(jq -r '.pr.mergedAt // empty' "$f")

    local pr_link="-"
    [[ -n "$pr_url" ]] && pr_link="<a href=\"${pr_url}\" target=\"_blank\">PR ↗</a>"
    local merged_display="${merged_at:-"-"}"
    [[ -n "$merged_at" && "$merged_at" != "null" ]] && merged_display="${merged_at%T*}"

    cat <<ROW
        <tr>
          <td><a href="${JIRA_BASE_URL}/browse/${ticket}" target="_blank">${ticket}</a></td>
          <td>${type}</td>
          <td>${pr_link}</td>
          <td>${merged_display}</td>
        </tr>
ROW
  done
}

# Generate the HTML
cat > "$OUTPUT_FILE" <<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dev Helper Summary — ${TODAY}</title>
  <style>
    :root {
      --bg-primary: #1e1e1e;
      --bg-secondary: #252526;
      --bg-card: #2d2d2d;
      --bg-card-hover: #333333;
      --text-primary: #cccccc;
      --text-secondary: #9d9d9d;
      --text-link: #4fc1ff;
      --border: #404040;
      --badge-planning: #007acc;
      --badge-implementation: #388a34;
      --badge-pr: #8a5cf5;
      --badge-post-merge: #2aa198;
      --badge-done: #6a6a6a;
      --badge-waiting: #d19a66;
      --accent: #007acc;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      padding: 2rem;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 2.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .header h1 {
      font-size: 1.8rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #e1e1e1;
    }

    .header__date {
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    .header__counts {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 1rem;
    }

    .header__count {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .header__count-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #e1e1e1;
    }

    .header__count-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
    }

    .section {
      margin-bottom: 2.5rem;
    }

    .section__title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #e1e1e1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section__title::before {
      content: '';
      width: 3px;
      height: 1.2em;
      background: var(--accent);
      border-radius: 2px;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem 1.2rem;
      transition: background 0.15s;
    }

    .card:hover { background: var(--bg-card-hover); }
    .card--waiting { border-left: 3px solid var(--badge-waiting); }

    .card__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .card__ticket {
      font-weight: 600;
      font-size: 1rem;
      color: var(--text-link);
      text-decoration: none;
    }

    .card__ticket:hover { text-decoration: underline; }

    .badge {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      color: #fff;
    }

    .badge--planning { background: var(--badge-planning); }
    .badge--implementation { background: var(--badge-implementation); }
    .badge--pr { background: var(--badge-pr); }
    .badge--post-merge { background: var(--badge-post-merge); }
    .badge--done { background: var(--badge-done); }
    .badge--waiting { background: var(--badge-waiting); }

    .card__meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 0.4rem;
    }

    .card__branch {
      margin-top: 0.4rem;
    }

    .card__branch code {
      font-size: 0.8rem;
      background: var(--bg-secondary);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      color: var(--text-primary);
    }

    .card__pr {
      margin-top: 0.5rem;
    }

    .card__pr a {
      color: var(--text-link);
      text-decoration: none;
      font-size: 0.85rem;
    }

    .card__pr a:hover { text-decoration: underline; }

    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--bg-card);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border);
    }

    th, td {
      padding: 0.7rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }

    th {
      background: var(--bg-secondary);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      font-weight: 600;
    }

    td a {
      color: var(--text-link);
      text-decoration: none;
    }

    td a:hover { text-decoration: underline; }

    tr:last-child td { border-bottom: none; }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .stat {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.2rem;
      text-align: center;
    }

    .stat__value {
      font-size: 2rem;
      font-weight: 700;
      color: #e1e1e1;
    }

    .stat__label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin-top: 0.3rem;
    }

    .empty {
      color: var(--text-secondary);
      font-style: italic;
      padding: 1rem;
    }

    @media (max-width: 600px) {
      body { padding: 1rem; }
      .header__counts { gap: 1rem; }
      .cards { grid-template-columns: 1fr; }
      .stats { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>Dev Helper Summary</h1>
      <div class="header__date">${TODAY}</div>
      <div class="header__counts">
        <div class="header__count">
          <span class="header__count-value">${TOTAL_ACTIVE}</span>
          <span class="header__count-label">Active</span>
        </div>
        <div class="header__count">
          <span class="header__count-value">${TOTAL_WAITING}</span>
          <span class="header__count-label">Waiting</span>
        </div>
        <div class="header__count">
          <span class="header__count-value">${TOTAL_DONE}</span>
          <span class="header__count-label">Done</span>
        </div>
      </div>
    </header>

    <section class="section">
      <h2 class="section__title">Active Tickets</h2>
      <div class="cards">
$(if ((TOTAL_ACTIVE > 0)); then build_active_cards; else echo '        <p class="empty">No active tickets</p>'; fi)
      </div>
    </section>

    <section class="section">
      <h2 class="section__title">Waiting Tickets</h2>
      <div class="cards">
$(if ((TOTAL_WAITING > 0)); then build_waiting_cards; else echo '        <p class="empty">No waiting tickets</p>'; fi)
      </div>
    </section>

    <section class="section">
      <h2 class="section__title">Recently Completed</h2>
$(if ((TOTAL_DONE > 0)); then
cat <<TABLE
      <table>
        <thead>
          <tr><th>Ticket</th><th>Type</th><th>PR</th><th>Merged</th></tr>
        </thead>
        <tbody>
$(build_done_rows)
        </tbody>
      </table>
TABLE
else
  echo '      <p class="empty">No completed tickets</p>'
fi)
    </section>

    <section class="section">
      <h2 class="section__title">Summary Stats</h2>
      <div class="stats">
        <div class="stat">
          <div class="stat__value">${TOTAL_ALL}</div>
          <div class="stat__label">Total Tracked</div>
        </div>
        <div class="stat">
          <div class="stat__value">${PRS_OPENED}</div>
          <div class="stat__label">PRs Opened</div>
        </div>
        <div class="stat">
          <div class="stat__value">${TOTAL_DONE}</div>
          <div class="stat__label">Completed</div>
        </div>
        <div class="stat">
          <div class="stat__value">${TOTAL_ACTIVE}</div>
          <div class="stat__label">In Progress</div>
        </div>
      </div>
    </section>

    <footer style="text-align:center; color:var(--text-secondary); font-size:0.8rem; margin-top:2rem; padding-top:1rem; border-top:1px solid var(--border);">
      Generated by dev-helper • <a href="https://github.com/${GH_REPO}" target="_blank" style="color:var(--text-link); text-decoration:none;">${GH_REPO}</a>
    </footer>
  </div>
</body>
</html>
HTML

echo "Summary generated: $OUTPUT_FILE"
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$OUTPUT_FILE"
elif command -v open >/dev/null 2>&1; then
  open "$OUTPUT_FILE"
else
  echo "Open manually: $OUTPUT_FILE"
fi
