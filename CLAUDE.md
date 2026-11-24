# money: notes for Claude

This repo is Steve's retirement-planning web apps on GitHub Pages (https://autodax.github.io/money/). Each app is one
self-contained HTML file (HTML, CSS and JavaScript together) with no build step and no server.
Pushing to `main` publishes within a minute or two.

**This repo is public.** Anything written here, including these notes, can be read by anyone.
Never put personal details in the repo: no addresses, account numbers, balances, salary, or tokens.

## Working with Steve

- Steve doesn't read code. Describe changes in plain language: what he'll see and do, not how
  it's built. Don't paste code into replies.
- Ask clarifying questions in plain text, never as pop-up multiple-choice dialogs.
- He uses an iPhone (Safari, and apps saved to the home screen as web apps) and a Mac (desktop browser). Mobile-first, but
  everything must also work at desktop widths; the iPhone-only tweaks (115% scale, locked viewport) must not affect the Mac.
- When a choice is visual, show a few options side by side before committing to one.
- Do the work, test it, and push it; then say briefly what changed and anything he must do
  (Mac: reload the page; iPhone: swipe the app away and reopen it).

## Project notes

Other assistants start from `AGENTS.md`. Keep it and `tests/` current too.

@notes/retirement.md

## Every change

1. `git fetch` and rebase onto `origin/main` before pushing. Other Claude sessions also push to this repo.
2. Test before pushing. Headless Chrome with Playwright is enough for layout and logic. Use an
   iPhone-sized viewport (402 × 874; the home-screen web app reports 402 × 812) and a desktop width.
3. Commit messages in plain language, describing what changed for the user.

## Keeping these notes current

When you learn something a future session would otherwise have to rediscover (a decision Steve made,
a preference, an iPhone quirk, how a part of an app works, a pending idea), update `notes/retirement.md`
in the same commit. Keep entries short and remove anything no longer true. Only Steve's stated
decisions go under "Decisions"; don't record guesses as decisions.
