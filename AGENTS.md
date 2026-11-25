# Start here (for any AI assistant)

This repo is Steve's retirement-planning web apps, live at https://autodax.github.io/money/ (GitHub Pages, public).
Read this file, then `notes/retirement.md` (what each part does and the decisions Steve has made).
`CLAUDE.md` holds the same working rules in Claude's format.

## Ground rules

- **Public repo.** Never put personal details in it: no addresses, account numbers, balances, salary, tokens.
  Test data in `tests/` is made up. Keep it that way.
- Steve doesn't want to read code. Explain every change in plain language: what he'll see and do. No code in replies.
  Pop-up multiple-choice dialogs are fine when asking clarifying questions.
- He uses an iPhone (Safari and home-screen web apps) and a Mac. Both must work. The iPhone-only tweaks
  (115% scale, locked viewport) must not change the Mac layout.
- Do the work, test it, push it, then say briefly what changed. Tell him what to do to see it:
  Mac: "reload the page". iPhone: "swipe the app away and reopen it".
- Before pushing: `git fetch` and rebase onto `origin/main` (other assistants push here too). Commit messages in plain
  language, describing what changed for him.
- Update `notes/retirement.md` in the same commit whenever behavior, a decision or a quirk changes. Record only
  decisions Steve actually stated as decisions. Remove anything that is no longer true.

## How the pieces fit

- There is one file per tool per tax year: `wizardYYYY.html`, `rothYYYY.html`, `taxYYYY.html`, `spendYYYY.html`
  (2026, 2027, 2028). No build step, no shared code files: **each file is self-contained, and the tax engine is
  copied into the Wizard, the Roth planner and the tax estimator.** A change to tax logic or tax figures has to be made
  in every copy and in every year it applies to, then tested so they still agree.
- The Wizard (`yr` = the current year) plans the *next* year: Roth contributions, extra withholding, the Roth
  conversion, spending. Its plan page links to the other tools with the entries packed into the link after the `#`.
  The links use the full `https://autodax.github.io/money/...` address.
- Entries are saved in the browser (`rpwState`) and in the link (`#z=...`). Carrying a plan to the next year's
  Wizard clears the year-specific entries listed in the carry-forward code.
- The Wizard and the Roth planner must reach the same conversion for the same strategy. `tests/compare.js` checks this.
- `wizard.html` and `roth.html` just forward to the 2026 versions. `index.html` is an older copy of the 2026 tax estimator.
- Dates: the yearly check-in is Dec 15. Nine-month pay (19.5 pay periods) is built in. The last work year is 2028
  (paychecks end in late May 2028). 2028 tax figures are **placeholders** until the real ones are published.

## When something must be updated

- **New tax figures** (IRS brackets, standard deduction and so on in October-November; Social Security wage base
  in October; Medicare premiums and IRMAA tiers about mid-November): edit the TAX FIGURES block in each file for
  that year (search for "TAX FIGURES"), keep them identical across Wizard, planner and estimator, and remove the yellow
  placeholder notice on 2028 files once real figures are in.
- **A new tax year:** copy the newest year's files to the new year, change the year in each, and follow the notes.
- Details and past decisions are in `notes/retirement.md`.

## Testing (needs Node and Playwright; run from the repo root)

- `node tests/errors.js`: opens every page and lists script errors.
- `node tests/compare.js wizard2027.html` (also 2026, 2028): runs 32 strategy cases and checks the rules hold, the cash
  flow balances, the plan text renders, and the Roth planner agrees with the Wizard. Takes several minutes.
  Expect 0 failing, except one known knife-edge case on 2028 (see the notes).
- `node tests/compare-level.js wizard2027.html`: the "level" strategy at several ceilings.
- `node tests/plan-text.js qtr wizard2027.html "&skg=40000"`: prints the plan text for a made-up last-year case.
- `node tests/leave-payout.js`: checks the leave-payout box shows only in the last work year.
- Check layout at phone width (402 x 874) and desktop width. WebKit/real iPhone Safari can't be tested in a sandbox.
  Steve checks on his phone.

## Wording of text Steve reads in the apps

- First person, as if Steve is writing his own plan: "my last paycheck", "I set payroll to...".
- Short, plain imperatives for actions ("Pay $2,292 on Apr 15"). Dollar amounts rounded, with commas.
- Years in parentheses after labels, e.g. "Roth conversion (2027)". Capitalize "Step 2" and "Wizard".
- Curly quotes and apostrophes. No hover tooltips (they don't work on a phone); put help text on the page.
- Bold for status labels. Page font is Literata.
- Say "Oracle HR" for extra paycheck withholding at USF (not a W-4).
- Money-math wording should state what is and isn't included, and avoid jargon he hasn't used.
