// One renderer per page. Each returns the page's HTML as a string and,
// where the page has a chart, a hook that draws it once the HTML is in the
// document. main.js calls render(route) and then runs the hooks.

function categoryOf(state, id) {
  return state.categories.find((c) => c.id === id) || { label: id, color: '#7a7a7a' };
}

function spentByCategory(state) {
  const spent = {};
  for (const t of state.transactions) spent[t.category] = (spent[t.category] || 0) + t.amount;
  return spent;
}

function totals(state) {
  const income = state.income.reduce((sum, s) => sum + s.amount, 0);
  const planned = state.categories.reduce((sum, c) => sum + c.plan, 0);
  const spent = state.transactions.reduce((sum, t) => sum + t.amount, 0);
  return { income, planned, spent, left: planned - spent, saved: income - planned };
}

function budgetBarRow(state, category, spent) {
  const used = spent[category.id] || 0;
  const share = Math.min(100, (used / category.plan) * 100);
  const over = used > category.plan;
  return `
    <li class="budget-row">
      <div class="budget-row-head">
        <span class="budget-dot" style="background:${category.color}"></span>
        <span class="budget-name">${escapeHtml(category.label)}</span>
        <span class="budget-figures">${money(used)} of ${moneyWhole(category.plan)}</span>
      </div>
      <div class="meter" role="img" aria-label="${escapeHtml(category.label)}: ${money(used)} spent of ${moneyWhole(category.plan)} planned">
        <span class="meter-fill ${over ? 'over' : ''}" style="width:${share}%;background:${category.color}"></span>
      </div>
      <p class="budget-note">${over ? 'Over budget by ' + money(used - category.plan) + ' — trim it next week.' : money(category.plan - used) + ' left this month.'}</p>
    </li>`;
}

function transactionRows(state, list) {
  return list.map((t) => {
    const cat = categoryOf(state, t.category);
    return `
      <li class="txn">
        <span class="txn-dot" style="background:${cat.color}"></span>
        <span class="txn-main">
          <span class="txn-label">${escapeHtml(t.label)}</span>
          <span class="txn-meta">${niceDate(t.date)} · ${escapeHtml(cat.label)}</span>
        </span>
        <span class="txn-amount">−${money(t.amount)}</span>
      </li>`;
  }).join('');
}

// ---------------------------------------------------------------- dashboard
function renderDashboard(state) {
  const t = totals(state);
  const spent = spentByCategory(state);
  const recent = [...state.transactions].slice(0, 6);
  const goals = state.goals;
  const savedSoFar = goals.reduce((s, g) => s + g.saved, 0);
  const goalTargets = goals.reduce((s, g) => s + g.target, 0);

  return {
    title: 'Dashboard',
    html: `
    <section class="page-head">
      <p class="eyebrow">November 2026 · ${escapeHtml(state.household.name)}</p>
      <h1>Where the month stands</h1>
      <p class="lede">Income in, spending out, and what is left for the goals — all from the Hartleys' own ledger, up to today, 24 November.</p>
    </section>

    <section class="stat-grid" aria-label="This month at a glance">
      <article class="stat"><p class="stat-label">Income this month</p><p class="stat-value">${moneyWhole(t.income)}</p><p class="stat-sub">3 sources · payday is the 1st &amp; 15th</p></article>
      <article class="stat"><p class="stat-label">Spent so far</p><p class="stat-value">${moneyWhole(t.spent)}</p><p class="stat-sub">${pct(t.spent, t.planned)} of the ${moneyWhole(t.planned)} plan</p></article>
      <article class="stat"><p class="stat-label">Left to spend</p><p class="stat-value">${moneyWhole(t.left)}</p><p class="stat-sub">6 days left in November</p></article>
      <article class="stat highlight"><p class="stat-label">Planned saving</p><p class="stat-value">${moneyWhole(t.saved)}</p><p class="stat-sub">${pct(t.saved, t.income)} of income · on track</p></article>
    </section>

    <section class="two-col">
      <article class="card">
        <h2>Spending by category</h2>
        <p class="card-sub">Every dollar spent so far this month, grouped where it went.</p>
        <canvas id="donut" class="donut" width="320" height="320" role="img" aria-label="Donut chart of spending by category"></canvas>
        <ul class="legend">
          ${state.categories.map((c) => `<li><span class="budget-dot" style="background:${c.color}"></span>${escapeHtml(c.label)} · <strong>${money(spent[c.id] || 0)}</strong></li>`).join('')}
        </ul>
      </article>

      <article class="card">
        <h2>Budget check</h2>
        <p class="card-sub">Planned against spent, category by category. Housing is fixed; groceries are the one to watch.</p>
        <ul class="budget-list">
          ${state.categories.map((c) => budgetBarRow(state, c, spent)).join('')}
        </ul>
        <p class="card-link"><a href="#/planner">Adjust the plan →</a></p>
      </article>
    </section>

    <section class="two-col">
      <article class="card">
        <h2>Recent spending</h2>
        <p class="card-sub">The latest entries in the ledger.</p>
        <ul class="txn-list">${transactionRows(state, recent)}</ul>
        <p class="card-link"><a href="#/expenses">See all ${state.transactions.length} expenses →</a></p>
      </article>

      <article class="card">
        <h2>Savings goals</h2>
        <p class="card-sub">${moneyWhole(savedSoFar)} saved towards ${moneyWhole(goalTargets)} across ${goals.length} goals.</p>
        <ul class="goal-list">
          ${goals.map((g) => `
          <li class="goal-row">
            <div class="goal-row-head"><span>${escapeHtml(g.label)}</span><span>${moneyWhole(g.saved)} / ${moneyWhole(g.target)}</span></div>
            <div class="meter"><span class="meter-fill" style="width:${Math.min(100, (g.saved / g.target) * 100)}%"></span></div>
          </li>`).join('')}
        </ul>
        <p class="card-link"><a href="#/goals">Open the goals →</a></p>
      </article>
    </section>`,
    afterRender() {
      const canvas = document.getElementById('donut');
      if (canvas) drawDonut(canvas, state.categories.map((c) => ({ label: c.label, value: spent[c.id] || 0, color: c.color })));
    },
  };
}

// ------------------------------------------------------------------ planner
function renderPlanner(state) {
  const t = totals(state);
  const spent = spentByCategory(state);
  const needs = ['housing', 'groceries', 'transport', 'utilities', 'health'];
  const wants = ['fun', 'kids', 'household', 'giving', 'other'];
  const sumIds = (ids) => ids.reduce((s, id) => s + (state.categories.find((c) => c.id === id)?.plan || 0), 0);
  const needsTotal = sumIds(needs);
  const wantsTotal = sumIds(wants);

  return {
    title: 'Budget Planner',
    html: `
    <section class="page-head">
      <p class="eyebrow">Plan first, spend second</p>
      <h1>The November budget planner</h1>
      <p class="lede">Set what each part of the household may spend, and the planner shows what is left for saving before the month begins. Change a number and the totals move at once.</p>
    </section>

    <section class="two-col">
      <article class="card">
        <h2>Monthly income — ${moneyWhole(t.income)}</h2>
        <ul class="income-list">
          ${state.income.map((s) => `
          <li><span>${escapeHtml(s.label)}</span><strong>${moneyWhole(s.amount)}</strong><span class="income-note">${escapeHtml(s.note)}</span></li>`).join('')}
        </ul>
        <label class="field">
          <span>Add a pay rise or extra income</span>
          <span class="field-row">
            <input id="extra-income" type="number" min="0" step="10" placeholder="e.g. 250" aria-label="Extra monthly income">
            <button class="btn" id="add-income-btn" type="button">Add income</button>
          </span>
        </label>
        <p class="form-note" id="income-note">Extra income goes straight to the saving figure below.</p>
      </article>

      <article class="card rule-card">
        <h2>The 50 / 30 / 20 guide</h2>
        <p class="card-sub">A common rule of thumb: about half of income on needs, under a third on wants, a fifth saved.</p>
        <ul class="rule-list">
          <li><span>Needs</span><strong>${moneyWhole(needsTotal)} · ${pct(needsTotal, t.income)}</strong><span class="rule-target">aim ≈ 50%</span></li>
          <li><span>Wants</span><strong>${moneyWhole(wantsTotal)} · ${pct(wantsTotal, t.income)}</strong><span class="rule-target">aim ≤ 30%</span></li>
          <li><span>Saving</span><strong>${moneyWhole(t.saved)} · ${pct(t.saved, t.income)}</strong><span class="rule-target">aim ≥ 20%</span></li>
        </ul>
        <p class="rule-verdict">${t.saved / t.income >= 0.2 ? '✓ This plan saves more than a fifth of income — it clears the guide.' : 'This plan saves under a fifth of income — trim a want or two to reach 20%.'}</p>
      </article>
    </section>

    <section class="card">
      <h2>Set each category's monthly budget</h2>
      <p class="card-sub">Drag a slider or type a number. The spent bar shows where the month already stands against the new plan.</p>
      <div class="planner-grid">
        ${state.categories.map((c) => `
        <div class="plan-field">
          <label for="plan-${c.id}"><span class="budget-dot" style="background:${c.color}"></span>${escapeHtml(c.label)} <em>${escapeHtml(c.blurb)}</em></label>
          <div class="field-row">
            <input type="range" id="range-${c.id}" data-category="${c.id}" min="0" max="${Math.max(2000, c.plan * 2)}" step="10" value="${c.plan}" aria-label="${escapeHtml(c.label)} budget slider">
            <input type="number" id="plan-${c.id}" data-category="${c.id}" min="0" step="10" value="${c.plan}" aria-label="${escapeHtml(c.label)} monthly budget in dollars">
          </div>
          <p class="plan-spent">Spent so far: <strong>${money(spent[c.id] || 0)}</strong></p>
        </div>`).join('')}
      </div>
      <div class="planner-totals">
        <p><span>Planned spending</span><strong id="plan-total">${moneyWhole(t.planned)}</strong></p>
        <p><span>Left for saving</span><strong id="save-total">${moneyWhole(t.saved)}</strong></p>
        <p class="planner-reset"><button class="btn ghost" id="reset-plan-btn" type="button">Reset to the original plan</button></p>
      </div>
      <canvas id="plan-bars" class="plan-bars" role="img" aria-label="Bar chart of planned against spent by category"></canvas>
    </section>`,
    afterRender() {
      const canvas = document.getElementById('plan-bars');
      if (canvas) drawPlanBars(canvas, state.categories.map((c) => ({ label: c.label, plan: c.plan, spent: spent[c.id] || 0, color: c.color })));
    },
  };
}

// ----------------------------------------------------------------- expenses
function renderExpenses(state, filter) {
  const t = totals(state);
  const list = filter && filter !== 'all'
    ? state.transactions.filter((x) => x.category === filter)
    : state.transactions;

  return {
    title: 'Expenses',
    html: `
    <section class="page-head">
      <p class="eyebrow">The ledger · ${state.transactions.length} entries in November</p>
      <h1>Every expense, in one place</h1>
      <p class="lede">Add what the household spends as it happens, and the dashboard, planner and charts all move with it. Filter by category to find where the money went.</p>
    </section>

    <section class="two-col">
      <article class="card">
        <h2>Add an expense</h2>
        <form id="expense-form">
          <label class="field"><span>What was it?</span>
            <input id="exp-label" type="text" required maxlength="80" placeholder="e.g. Weekly shop — GreenMart">
          </label>
          <label class="field"><span>How much?</span>
            <input id="exp-amount" type="number" required min="0.01" step="0.01" placeholder="0.00">
          </label>
          <label class="field"><span>Category</span>
            <select id="exp-category">${state.categories.map((c) => `<option value="${c.id}">${escapeHtml(c.label)}</option>`).join('')}</select>
          </label>
          <label class="field"><span>Date</span>
            <input id="exp-date" type="date" value="2026-11-24" required>
          </label>
          <button class="btn" type="submit">Add to the ledger</button>
          <p class="form-note" id="expense-note">Added expenses appear below at once and count in every total.</p>
        </form>
      </article>

      <article class="card">
        <h2>This month so far</h2>
        <p class="big-number">${moneyWhole(t.spent)}</p>
        <p class="card-sub">spent of ${moneyWhole(t.planned)} planned · ${moneyWhole(t.left)} left · average ${money(t.spent / 24)} a day over 24 days.</p>
        <h3 class="mini-head">Biggest single spends</h3>
        <ol class="top-list">
          ${[...state.transactions].sort((a, b) => b.amount - a.amount).slice(0, 5).map((x) => `
          <li><span>${escapeHtml(x.label)}</span><strong>${money(x.amount)}</strong></li>`).join('')}
        </ol>
      </article>
    </section>

    <section class="card">
      <h2>All expenses</h2>
      <div class="filter-row" role="group" aria-label="Filter expenses by category">
        <a href="#/expenses" class="chip ${!filter || filter === 'all' ? 'active' : ''}">All</a>
        ${state.categories.map((c) => `<a href="#/expenses/${c.id}" class="chip ${filter === c.id ? 'active' : ''}">${escapeHtml(c.label)}</a>`).join('')}
      </div>
      <p class="card-sub">Showing ${list.length} expense${list.length === 1 ? '' : 's'}${filter && filter !== 'all' ? ' in ' + escapeHtml(categoryOf(state, filter).label) : ''} · ${money(list.reduce((s, x) => s + x.amount, 0))} in total.</p>
      <ul class="txn-list wide">${transactionRows(state, list)}</ul>
    </section>`,
    afterRender() {},
  };
}

// -------------------------------------------------------------------- goals
function renderGoals(state) {
  const savedSoFar = state.goals.reduce((s, g) => s + g.saved, 0);
  const goalTargets = state.goals.reduce((s, g) => s + g.target, 0);

  return {
    title: 'Savings Goals',
    html: `
    <section class="page-head">
      <p class="eyebrow">Saving with a reason</p>
      <h1>Savings goals</h1>
      <p class="lede">Four things the household is saving for, with a target date each. Add a contribution and watch the bar move — the Christmas fund is already there.</p>
    </section>

    <section class="stat-grid">
      <article class="stat"><p class="stat-label">Saved across all goals</p><p class="stat-value">${moneyWhole(savedSoFar)}</p><p class="stat-sub">of ${moneyWhole(goalTargets)} in targets</p></article>
      <article class="stat"><p class="stat-label">Goals reached</p><p class="stat-value">${state.goals.filter((g) => g.saved >= g.target).length} of ${state.goals.length}</p><p class="stat-sub">Christmas fund — done in October</p></article>
      <article class="stat highlight"><p class="stat-label">Monthly saving set aside</p><p class="stat-value">${moneyWhole(totals(state).saved)}</p><p class="stat-sub">from the November plan</p></article>
    </section>

    <section class="goal-grid">
      ${state.goals.map((g) => {
        const done = g.saved >= g.target;
        const share = Math.min(100, (g.saved / g.target) * 100);
        return `
      <article class="card goal-card ${done ? 'done' : ''}">
        <h2>${escapeHtml(g.label)} ${done ? '<span class="done-badge">✓ Reached</span>' : ''}</h2>
        <p class="card-sub">${escapeHtml(g.note)}</p>
        <p class="goal-figures"><strong>${moneyWhole(g.saved)}</strong> of ${moneyWhole(g.target)} · ${Math.round(share)}%</p>
        <div class="meter big"><span class="meter-fill" style="width:${share}%"></span></div>
        <p class="goal-date">Target: ${escapeHtml(g.targetDate)} · ${money(g.target - g.saved)} to go</p>
        <form class="contribute-form" data-goal="${g.id}">
          <label><span>Add a contribution</span>
            <span class="field-row">
              <input type="number" min="1" step="5" placeholder="e.g. 50" aria-label="Contribution to ${escapeHtml(g.label)}" required>
              <button class="btn" type="submit">Add $</button>
            </span>
          </label>
        </form>
      </article>`;
      }).join('')}
    </section>

    <section class="card">
      <h2>Start a new goal</h2>
      <form id="goal-form" class="inline-form">
        <label class="field"><span>What are you saving for?</span>
          <input id="goal-label" type="text" required maxlength="60" placeholder="e.g. New bikes for the kids">
        </label>
        <label class="field"><span>Target amount ($)</span>
          <input id="goal-target" type="number" required min="10" step="10" placeholder="e.g. 400">
        </label>
        <label class="field"><span>Target date</span>
          <input id="goal-date" type="text" required maxlength="20" placeholder="e.g. May 2027">
        </label>
        <button class="btn" type="submit">Create goal</button>
      </form>
      <p class="form-note" id="goal-note">A new goal starts at $0 and joins the list above.</p>
    </section>`,
    afterRender() {},
  };
}

// ----------------------------------------------------------------- insights
function renderInsights(state) {
  const t = totals(state);
  const history = state.history;
  // November is still running, so the "best month" and the average are
  // judged on the five finished months only.
  const finished = history.slice(0, -1);
  const bestMonth = [...finished].sort((a, b) => (a.income - a.spent) - (b.income - b.spent)).pop();
  const spent = spentByCategory(state);
  const topCategory = [...state.categories].sort((a, b) => (spent[b.id] || 0) - (spent[a.id] || 0))[0];
  const avgSpent = finished.reduce((s, m) => s + m.spent, 0) / finished.length;

  return {
    title: 'Insights',
    html: `
    <section class="page-head">
      <p class="eyebrow">Six months of the household's money</p>
      <h1>Insights &amp; monthly breakdown</h1>
      <p class="lede">The pattern behind the numbers: what the household keeps each month, which category runs away with the money, and four small changes worth making.</p>
    </section>

    <section class="stat-grid">
      <article class="stat"><p class="stat-label">Best saving month</p><p class="stat-value">${escapeHtml(bestMonth.month)}</p><p class="stat-sub">${moneyWhole(bestMonth.income - bestMonth.spent)} kept of ${moneyWhole(bestMonth.income)}</p></article>
      <article class="stat"><p class="stat-label">Biggest spend so far</p><p class="stat-value">${escapeHtml(topCategory.label)}</p><p class="stat-sub">${money(spent[topCategory.id] || 0)} in November</p></article>
      <article class="stat"><p class="stat-label">Average monthly spend</p><p class="stat-value">${moneyWhole(avgSpent)}</p><p class="stat-sub">across the last five finished months</p></article>
      <article class="stat highlight"><p class="stat-label">November saving rate</p><p class="stat-value">${pct(t.saved, t.income)}</p><p class="stat-sub">${moneyWhole(t.saved)} of ${moneyWhole(t.income)} kept</p></article>
    </section>

    <section class="card">
      <h2>Income against spending, month by month</h2>
      <p class="card-sub">Green is what came in, terracotta is what went out. August was the dearest month — the summer holiday and the car service landed together.</p>
      <canvas id="month-bars" class="month-bars" role="img" aria-label="Bar chart of income and spending for the last six months"></canvas>
      <table class="breakdown">
        <thead><tr><th>Month</th><th>Income</th><th>Spent</th><th>Kept</th><th>Saving rate</th></tr></thead>
        <tbody>
          ${history.map((m) => `
          <tr class="${m.month === 'Nov 2026' ? 'current' : ''}">
            <td>${escapeHtml(m.month)}${m.month === 'Nov 2026' ? ' (so far)' : ''}</td>
            <td>${moneyWhole(m.income)}</td><td>${moneyWhole(m.spent)}</td>
            <td>${moneyWhole(m.income - m.spent)}</td><td>${pct(m.income - m.spent, m.income)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </section>

    <section class="card">
      <h2>Four things worth doing</h2>
      <ol class="tips">
        ${state.tips.map((tip) => `<li><h3>${escapeHtml(tip.title)}</h3><p>${escapeHtml(tip.body)}</p></li>`).join('')}
      </ol>
    </section>

    <section class="card note-card">
      <h2>A note for the household</h2>
      <p>November is on track: ${moneyWhole(t.spent)} spent of a ${moneyWhole(t.planned)} plan, with six days left and ${moneyWhole(t.left)} still in the account. Groceries are the one category to watch — ${money(spent.groceries || 0)} of ${moneyWhole(state.categories.find((c) => c.id === 'groceries').plan)} already gone. One planned shop a week, and the month lands inside its plan.</p>
    </section>`,
    afterRender() {
      const canvas = document.getElementById('month-bars');
      if (canvas) drawMonthBars(canvas, history);
    },
  };
}
