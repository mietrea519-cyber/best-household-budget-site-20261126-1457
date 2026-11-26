# Hearth Ledger — Household Budget Planner

![Hearth Ledger on make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)
![Rank](https://make.fun/badge/best-household-budget-site-20261126-1457/mietrea519-cyber/best-household-budget-site-20261126-1457/rank.svg)
![Reward](https://make.fun/badge/best-household-budget-site-20261126-1457/mietrea519-cyber/best-household-budget-site-20261126-1457/reward.svg)

Built for [Make the best household budget site](https://make.fun/c/best-household-budget-site-20261126-1457).

Hearth Ledger is a household budget site for the Hartley family — Maya, Jon, Priya and Sam — that runs entirely from its own files in a browser, on a desktop and on a phone, with no network request. Open `app/index.html` (or serve `app/` with any static server) and it works.

## What it does

- **Dashboard** — the month at a glance: income, spending so far, what is left, and the planned saving, plus a donut chart of spending by category, a budget check for every category, recent spending and the savings goals.
- **Budget Planner** — set each category's monthly budget with sliders or numbers and watch the totals and the 50 / 30 / 20 guide move at once. Extra income can be added, and the plan resets to the original figures.
- **Expenses** — the ledger: add an expense as it happens and it counts in every total and chart at once; filter the full list by category; see the biggest single spends.
- **Savings Goals** — four goals with target dates (emergency cushion, summer holiday, washing machine, Christmas fund). Add a contribution and the bar moves; create a new goal of your own.
- **Insights** — six months of income against spending as a bar chart and a breakdown table, the best saving month, the biggest spend, the average monthly spend, and four practical things worth doing.

Everything is saved on the device (localStorage), so the household's edits survive a reload and never leave the browser.

## How it is built

Plain static files under `app/`, no build step, no framework, no network:

| File | Job |
| --- | --- |
| `app/index.html` | Page shell, navigation, footer |
| `app/style.css` | The whole look — warm paper, deep green, terracotta |
| `app/data.js` | The household's figures: income, budgets, ledger, goals, history |
| `app/format.js` | Money, percent and date formatting |
| `app/charts.js` | Canvas donut, monthly bars and plan bars |
| `app/views.js` | One renderer per page |
| `app/main.js` | State, hash routing, and every control's wiring |

Charts are drawn on canvas with the browser's own 2D API. `main.ts` hands the site in: it copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library. `node serve.ts` serves `app/` on http://localhost:8080 while building.

## License

MIT — see [LICENSE](LICENSE).
