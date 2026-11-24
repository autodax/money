# Retirement apps

Steve's retirement-planning tools, live at https://autodax.github.io/money/ (this repo, autodax/money; moved here from autodax.github.io on Nov 23, 2026). They run entirely in the browser; nothing is sent anywhere. Saved entries live in browser storage for the autodax.github.io site, which this repo shares with his other pages. The iPhone home-screen app has its own separate storage.
Personal figures belong in the apps' saved entries on his devices, never in this repo or these notes.

These notes were started from a quick read of the files; expand them as you work on these apps.

## Files

- `wizard2026.html`, `wizard2027.html`, `wizard2028.html`: Retirement Planning Wizard, one file per tax year. Strings
  the other tools together: accounts, Social Security and wages, taxes, Roth conversions, spending,
  and an "Actions in brief" to-do list with calendar events. Entries are saved in localStorage
  (`rpwState`) and in the link (`#z=…`); it can carry a plan forward to the next year's file.
- `roth2026.html`, `roth2027.html`, `roth2028.html`: Roth Conversion Planner (same tax engine as the Wizard).
- `tax2026.html`, `tax2027.html`, `tax2028.html`: Federal Tax Estimator, single filer.
- `spend2026.html`, `spend2027.html`, `spend2028.html`: "What to Withdraw This Year" calculator.
- `index.html`: an older copy of the 2026 tax estimator (a few labels differ from tax2026.html).
- `roth.html`, `wizard.html`: small pages that forward to the 2026 versions.

## Tests

- `tests/` holds the checks (see `AGENTS.md` for how to run them). They use made-up numbers only; never paste real balances or pay into them.

## How the files are organized

- Each big file has a "how this file is organized" comment near the top of its script.
- **TAX FIGURES** (search for it) is the block to edit when the IRS or Medicare publishes new
  figures. Keep the figures the same across the Wizard, Roth planner and tax estimator for a year.
- A new tax year means new `*YYYY.html` files once that year's figures are published (usually
  October or November of the year before).
- Pay calendar: nine-month academic pay (biweekly paychecks during the academic year, small prorated
  checks at the start and end), used by the Wizard for withholding and contributions.

## iPhone and Mac

- Steve uses the Wizard on both his iPhone and his Mac. Check layout at desktop width as well as phone width.

- Viewport is locked to the page width on phones (`minimum-scale=1`, no sideways panning).
- The Wizard is scaled to 115% on iPhone in the page itself (not through Safari's zoom setting).

## Yearly check-in date

- The yearly check-in (run next year's Wizard, set Roth contributions and withholding, convert the Roth top-up) is Dec 15, set in `lastNov()` in the Wizard. Steve chose it. Fidelity's own pages say only that a Roth conversion must be done by Dec 31 to count for the year; they give no earlier recommended date or processing time.

## Paying next year's tax (Wizard, Step 3)

- Setting `tpm`: quarterly estimated payments (default), extra paycheck withholding, or both; `wper` is the
  extra withholding per full paycheck for "both". It applies to next year's tax only; the current year's
  quarterly payments are unchanged.
- Extra withholding E (per paycheck x full paychecks; the two small prorated checks are not counted) lowers
  take-home pay by E, so the monthly transfers rise. In the code, `fund(E)` in `compute()` redoes the
  funding and the tax; for "withholding only" it repeats until E covers the tax left after regular withholding.
- The plan item, Actions in brief and calendar (Oracle HR withholding change on Dec 15, quarterly dates) all follow the choice.
- Steve sets extra withholding in Oracle HR at USF (not a W-4), so the plan says "Oracle HR". It stays in effect until changed, so the plan adds a Dec 15 reminder in the following year to change it or reset it to $0.
- With withholding only, the plan also shows the least extra withholding per paycheck that avoids a penalty (the safe harbor).


## Withholding on nine-month pay

- Payroll figures each paycheck as if it repeated all year (26 periods), so with about 19.5 pay periods it withholds more than the annual estimate (about $3,000 more on $138k). The Wizard uses `payrollWH`; the tax estimators have a "Paychecks in the year" box (`npay`) that does the same. Blank = 26.

## 2028 files (placeholders)

- The four `*2028.html` files were built on Nov 20, 2026 from the 2027 files, before the IRS, SSA and CMS published 2028
  figures. Their tax brackets, standard deduction, Social Security wage base, Medicare premiums and IRMAA tiers are
  **placeholders**: the 2027 figures raised about 2.5% (Medicare premiums 3.5%). Each page shows a yellow notice, and the
  TAX FIGURES comment says so. Replace them (and delete the notice) when the real figures come out: IRS in October-November
  2027, CMS about mid-November 2027, SSA in October 2027. `spend2028.html` has no tax figures.
- Last year of work (2028, paychecks end Fri May 26): in the 2027 Wizard, enter about 10.1 pay periods for next year (10 full
  paychecks plus the small late-May one). Fewer than 12 pay periods means a spring-only year: the plan shows paychecks January
  through late May, a small monthly transfer in those months and a full one from June, and no mid-August check. In the 2028 Wizard
  (plan year 2028), the "through December" brokerage transfer is split the same way. Not modeled: health insurance after leaving USF.
- Leave payout (Step 2, `skg` gross, `skd` pre-tax deductions, `skw` federal tax withheld; shown only when next year is the last work year): unused sick or annual leave paid with the last paycheck before June. Modeled from Steve's real stub of a similar payout: Social Security and Medicare tax are taken out of all of it (`R.sk.f`, from `ficaOf` on wages with and without it); a 3% retirement-plan contribution is taken pre-tax (lowers income tax only, not FICA); federal withholding is a flat 22% of the payout minus the pre-tax part. Blank `skd` = 3%, blank `skw` = 22% of the rest; typing 0 overrides. The income-taxable amount is `skg-skd` (tax preview, long-range projection, Roth planner link); `skw` is added to next year's withholding (`R.nextWH`); the net cash (`skg-skw-skd-f`) goes into checking on the paycheck date through `xMonths`. Not modeled: the after-tax Roth 457(b) contribution the stub also took from the payout (the year's Roth total is already an input). In the Wizard run in the last work year the payout is just part of that year's wages.
- The "next year's tax" link in the Wizard goes to `tax${min(next year, 2028)}.html`; when a `*2029` set exists, raise that 2028.
- The 32-case Wizard-versus-planner test on the 2028 files has one knife-edge case (`level rtgt=40000&tbrk=24` with a chosen
  spending amount): the Wizard's repeat-until-stable sizing can land one $500 step (49,500 vs 50,000) below the planner's. Not caused by the new figures.

## Medicare figures

- 2027 Part B premium ($209.40) and IRMAA tiers (single: $112,000 / $141,000 / $177,000 / $212,000 / $500,000) are the official CMS figures, published Nov 17, 2026. They are in the three 2027 files. The 2026 Wizard uses them only for next year's (2027) Medicare line; its other IRMAA figures and the 2026 Roth planner and tax estimator still carry the 2026 tiers. The 2028 figures come out about mid-November 2027.

## "Even out" conversion sizing

- Without a spending amount chosen, "Even out" sizes the yearly conversion at my safe spending (the most I can spend after tax with my target chance of lasting), the same figure the long-range check table shows as "This plan". The statement quotes that figure, so the two always agree. The Wizard and the Roth planner use the same basis (the 32-case test compares them).
