#!/usr/bin/env bash
# setup.sh — One-command GitHub Projects setup for the zergcore.dev redesign
#
# Usage:
#   1. cd into your frontend repo
#   2. Make sure `gh` CLI is installed and authenticated (gh auth status)
#   3. Run: bash setup.sh
#
# What this does:
#   - Creates 7 milestones (Epic 0–6)
#   - Creates all required labels
#   - Bulk-creates all ~45 issues from issues.csv with proper milestone + label assignments
#   - Issues link to the project board (you'll need to add them via the GitHub UI or `gh project item-add`)
#
# Requirements:
#   - GitHub CLI (`gh`) installed: https://cli.github.com
#   - Authenticated: `gh auth login`
#   - Run from inside the target repository (frontend repo)
#   - issues.csv in the same directory as this script

set -euo pipefail

# ============================================================================
# COLORS for output
# ============================================================================
RED=$'\033[31m'
GREEN=$'\033[32m'
YELLOW=$'\033[33m'
BLUE=$'\033[34m'
RESET=$'\033[0m'

info() { echo "${BLUE}[info]${RESET} $*"; }
ok()   { echo "${GREEN}[ok]${RESET}   $*"; }
warn() { echo "${YELLOW}[warn]${RESET} $*"; }
err()  { echo "${RED}[err]${RESET}  $*" >&2; }

# ============================================================================
# PRECHECKS
# ============================================================================
if ! command -v gh &> /dev/null; then
  err "GitHub CLI (gh) is not installed. https://cli.github.com"
  exit 1
fi

if ! gh auth status &> /dev/null; then
  err "Not authenticated with gh. Run 'gh auth login' first."
  exit 1
fi

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
if [[ -z "$REPO" ]]; then
  err "Not inside a GitHub repo, or repo not detected. cd into your frontend repo first."
  exit 1
fi
ok "Repository: $REPO"

if [[ ! -f "issues.csv" ]]; then
  err "issues.csv not found in current directory. Place it next to setup.sh."
  exit 1
fi

# ============================================================================
# MILESTONES
# ============================================================================
info "Creating milestones..."

MILESTONES=(
  "Epic 0 — Foundation|Foundational substrate: branch, design tokens, MDX pipeline, CI guards. Blocks every other epic.|"
  "Epic 1 — Homepage|Ship the new homepage end-to-end at /v2. Highest recruiter-impact surface.|"
  "Epic 2 — Selected Work|Build /v2/work index + /v2/work/[slug] case study pages. The conversion page.|"
  "Epic 3 — Writing|/v2/writing archive + essay detail pages + RSS feed.|"
  "Epic 4 — Experience|/v2/experience with depth-dial CV modes and metric typography.|"
  "Epic 5 — Skills + Credentials|/v2/skills typographic manifesto + ⌘K palette + /v2/credentials with degree-dominant layout.|"
  "Epic 6 — Polish + cutover|View transitions, OG images, bilingual content, a11y, performance, cutover to root.|"
)

for milestone in "${MILESTONES[@]}"; do
  IFS='|' read -r title description _due <<< "$milestone"
  if gh api "repos/$REPO/milestones" --jq ".[] | select(.title == \"$title\") | .number" | grep -q .; then
    warn "Milestone '$title' already exists, skipping"
  else
    gh api "repos/$REPO/milestones" \
      -f "title=$title" \
      -f "description=$description" \
      -f "state=open" > /dev/null
    ok "Created milestone: $title"
  fi
done

# ============================================================================
# LABELS
# ============================================================================
info "Creating labels..."

# format: name|color|description
LABELS=(
  "epic|6b46c1|High-level epic issue, parent of multiple tasks"
  "claude-code|d48aa6|Ready to be implemented by Claude Code"
  "needs-writing|e9bcce|Requires human writing — do not delegate to Claude Code"
  "blocked-by-design|fbbf24|Needs more mockup or design detail before implementation"
  "type: feat|22c55e|New feature or component"
  "type: refactor|3b82f6|Refactoring existing code without changing behavior"
  "type: chore|6b7280|Tooling, CI, infrastructure"
  "type: content|ec4899|Writing tasks (essays, case studies)"
  "type: perf|f97316|Performance work"
  "type: a11y|14b8a6|Accessibility work"
  "surface: homepage|0ea5e9|Affects the homepage"
  "surface: work|0ea5e9|Affects the /work pages"
  "surface: writing|0ea5e9|Affects the /writing pages"
  "surface: experience|0ea5e9|Affects the /experience page"
  "surface: credentials|0ea5e9|Affects the /credentials page"
  "surface: skills|0ea5e9|Affects the /skills page"
  "surface: infrastructure|6b7280|Affects build, CI, design tokens, shared primitives"
  "surface: legacy-cleanup|9ca3af|Cleanup of legacy / routes during refactor"
)

for label in "${LABELS[@]}"; do
  IFS='|' read -r name color description <<< "$label"
  if gh label list --json name --jq ".[] | select(.name == \"$name\") | .name" | grep -q .; then
    warn "Label '$name' already exists, skipping"
  else
    gh label create "$name" --color "$color" --description "$description" > /dev/null
    ok "Created label: $name"
  fi
done

# ============================================================================
# ISSUES
# ============================================================================
info "Creating issues from issues.csv..."

# Get milestone numbers
declare -A MILESTONE_NUMS
while IFS=$'\t' read -r num title; do
  MILESTONE_NUMS["$title"]=$num
done < <(gh api "repos/$REPO/milestones" --paginate --jq '.[] | "\(.number)\t\(.title)"')

# Parse CSV — robust handling of quoted multiline bodies
# Using python for CSV parsing since bash's read -d cannot handle quoted commas/newlines
python3 << 'PYEOF' > /tmp/issues_parsed.tsv
import csv, sys

with open("issues.csv", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        # Tab-separated output: title, milestone, labels, body
        title = row["title"]
        milestone = row["milestone"]
        labels = row["labels"]
        body = row["body"].replace("\t", "    ")  # neutralize tabs in body
        # Use \x1f as field separator, and \0 as record separator to allow newlines in body
        sys.stdout.write(f"{title}\x1f{milestone}\x1f{labels}\x1f{body}\0")
PYEOF

CREATED=0
SKIPPED=0
while IFS=$'\x1f' read -r -d '' title milestone labels body; do
  # Check if issue already exists by title
  existing=$(gh issue list --search "in:title \"$title\"" --json title --jq ".[] | select(.title == \"$title\") | .title" 2>/dev/null || echo "")
  if [[ -n "$existing" ]]; then
    warn "Issue '$title' already exists, skipping"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  ms_num="${MILESTONE_NUMS[$milestone]:-}"
  if [[ -z "$ms_num" ]]; then
    err "No milestone number found for '$milestone' (issue: $title)"
    continue
  fi

  # gh issue create requires labels as repeated --label flags
  label_args=()
  IFS=',' read -ra label_arr <<< "$labels"
  for lbl in "${label_arr[@]}"; do
    lbl_trimmed=$(echo "$lbl" | xargs)
    label_args+=(--label "$lbl_trimmed")
  done

  # Write body to temp file (gh handles multiline better via --body-file)
  body_file=$(mktemp)
  echo "$body" > "$body_file"

  if gh issue create \
    --title "$title" \
    --body-file "$body_file" \
    --milestone "$milestone" \
    "${label_args[@]}" > /dev/null; then
    ok "Created issue: $title"
    CREATED=$((CREATED + 1))
  else
    err "Failed to create issue: $title"
  fi

  rm -f "$body_file"

  # Rate limit safety — gh has generous limits but be polite
  sleep 0.3
done < /tmp/issues_parsed.tsv

rm -f /tmp/issues_parsed.tsv

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "================================================================"
ok "Setup complete!"
echo ""
echo "  Repository:        $REPO"
echo "  Issues created:    $CREATED"
echo "  Issues skipped:    $SKIPPED (already existed)"
echo "  Milestones:        7 (Epic 0–6)"
echo "  Labels:            18"
echo ""
echo "Next steps:"
echo "  1. Visit https://github.com/$REPO/issues to verify"
echo "  2. Add issues to your project board:"
echo "     https://github.com/users/zergcore/projects/1"
echo "     (use 'gh project item-add' or the UI)"
echo "  3. Set up project board views (Roadmap / Sprint / Claude-ready)"
echo "     per the plan we discussed"
echo "  4. Place .claude/ directory + CLAUDE.md at repo root"
echo "  5. Start with issue [0.0] (the setup task) — assign to yourself,"
echo "     then [0.1] is your first Claude Code task"
echo "================================================================"
