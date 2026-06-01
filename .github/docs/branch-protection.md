# Branch Protection Rules

These rules must be configured by a repo admin in **GitHub → Settings → Branches**.
They cannot be automated because they require admin access to the repository.

## `main`

Go to **Settings → Branches → Add rule**, set branch name pattern to `main`:

- [x] Require a pull request before merging
  - Required approvals: **1**
  - Dismiss stale pull request approvals when new commits are pushed: yes
- [x] Require status checks to pass before merging
  - Require branches to be up to date before merging: yes
  - Required status checks:
    - `Type-check / Lint / Build`
    - `Lighthouse (mobile ≥ 90)`
- [x] Require conversation resolution before merging
- [x] Do not allow bypassing the above settings

## `redesign`

Go to **Settings → Branches → Add rule**, set branch name pattern to `redesign`:

- [x] Require a pull request before merging
  - Required approvals: **0** (solo branch — approval gate not needed)
- [x] Require status checks to pass before merging
  - Require branches to be up to date before merging: yes
  - Required status checks:
    - `Type-check / Lint / Build`
    - `Lighthouse (mobile ≥ 90)`
- [x] Do not allow bypassing the above settings

## Vercel integration

The Lighthouse job depends on Vercel posting a preview deployment to each PR.
To enable this:

1. Connect the repository to a Vercel project at vercel.com/new.
2. Set the **Root Directory** to `frontend/`.
3. Vercel will post a GitHub Deployment for every push; the CI workflow's
   `patrickedqvist/wait-for-vercel-preview` step polls that deployment and
   surfaces the preview URL automatically — no extra secrets required.
4. Vercel's built-in GitHub bot will also post the preview URL as a PR comment.
