// Hearth Ledger — the glue. Loads the household's figures, renders the page
// for the current hash route, and wires up every control so it does what it
// says. Edits are kept in localStorage on this device; the original figures
// in data.js are never changed.

const STORE_KEY = 'hearth-ledger-v1';
const app = document.getElementById('app');

// Deep-copy the starting figures so edits never mutate the imported data.
function freshState() {
  return {
    household: { ...HOUSEHOLD },
    income: INCOME_SOURCES.map((s) => ({ ...s })),
    categories: CATEGORIES.map((c) => ({ ...c })),
    transactions: TRANSACTIONS.map((t) => ({ ...t })),
    goals: SAVINGS_GOALS.map((g) => ({ ...g })),
    history: MONTHLY_HISTORY.map((m) => ({ ...m })),
    tips: MONEY_TIPS.map((t) => ({ ...t })),
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (!saved) return freshState();
    const parsed = JSON.parse(saved);
    // Guard against a half-written save: fall back to the fresh figures.
    if (!parsed || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.categories)) return freshState();
    return parsed;
  } catch {
    return freshState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing or a full store: the site still works for the visit.
  }
}

let state = loadState();

// Read the route from the hash: "#/expenses/groceries" -> ["expenses", "groceries"].
function currentRoute() {
  const hash = window.location.hash || '#/';
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean);
}

function setActiveNav(route) {
  const page = route[0] || 'dashboard';
  for (const link of document.querySelectorAll('[data-nav]')) {
    link.classList.toggle('active', link.dataset.nav === page);
  }
}

function render() {
  const route = currentRoute();
  const page = route[0] || 'dashboard';
  let view;
  if (page === 'planner') view = renderPlanner(state);
  else if (page === 'expenses') view = renderExpenses(state, route[1]);
  else if (page === 'goals') view = renderGoals(state);
  else if (page === 'insights') view = renderInsights(state);
  else view = renderDashboard(state);

  document.title = view.title + ' — Hearth Ledger';
  app.innerHTML = view.html;
  setActiveNav(route);
  view.afterRender();
  wirePage();
  window.scrollTo(0, 0);
}

// --- planner controls: sliders and number boxes stay in step, totals move.
function wirePlanner() {
  const planInputs = app.querySelectorAll('input[data-category][type="number"]');
  const rangeInputs = app.querySelectorAll('input[data-category][type="range"]');

  function refreshTotals() {
    const income = state.income.reduce((s, x) => s + x.amount, 0);
    const planned = state.categories.reduce((s, c) => s + c.plan, 0);
    const planTotal = document.getElementById('plan-total');
    const saveTotal = document.getElementById('save-total');
    if (planTotal) planTotal.textContent = '$' + planned.toLocaleString('en-US');
    if (saveTotal) saveTotal.textContent = '$' + (income - planned).toLocaleString('en-US');
  }

  function setPlan(id, value) {
    const category = state.categories.find((c) => c.id === id);
    if (!category) return;
    category.plan = Math.max(0, Math.round(value));
    saveState(state);
    refreshTotals();
    const numberBox = app.querySelector(`input[type="number"][data-category="${id}"]`);
    const slider = app.querySelector(`input[type="range"][data-category="${id}"]`);
    if (numberBox) numberBox.value = category.plan;
    if (slider) slider.value = category.plan;
  }

  for (const input of planInputs) {
    input.addEventListener('change', () => setPlan(input.dataset.category, Number(input.value) || 0));
  }
  for (const input of rangeInputs) {
    input.addEventListener('input', () => setPlan(input.dataset.category, Number(input.value) || 0));
  }

  const addIncome = document.getElementById('add-income-btn');
  if (addIncome) {
    addIncome.addEventListener('click', () => {
      const box = document.getElementById('extra-income');
      const amount = Number(box.value);
      const note = document.getElementById('income-note');
      if (!amount || amount <= 0) {
        if (note) note.textContent = 'Type an amount first — e.g. 250 for a $250 pay rise.';
        return;
      }
      state.income.push({ id: 'extra-' + Date.now(), label: 'Extra income', amount, note: 'Added in the planner' });
      saveState(state);
      render();
      const after = document.getElementById('income-note');
      if (after) after.textContent = '$' + amount.toLocaleString('en-US') + ' a month added — the saving figure above moved with it.';
    });
  }

  const reset = document.getElementById('reset-plan-btn');
  if (reset) {
    reset.addEventListener('click', () => {
      const original = freshState();
      state.categories = original.categories;
      state.income = original.income;
      saveState(state);
      render();
    });
  }
}

// --- expense form: adds a row to the ledger and re-renders.
function wireExpenseForm() {
  const form = document.getElementById('expense-form');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const label = document.getElementById('exp-label').value.trim();
    const amount = Number(document.getElementById('exp-amount').value);
    const category = document.getElementById('exp-category').value;
    const date = document.getElementById('exp-date').value;
    const note = document.getElementById('expense-note');
    if (!label || !amount || amount <= 0 || !date) {
      if (note) note.textContent = 'Fill in all four fields — what, how much, which category, and when.';
      return;
    }
    state.transactions.unshift({ id: 't' + Date.now(), date, label, category, amount });
    saveState(state);
    render();
    const after = document.getElementById('expense-note');
    if (after) after.textContent = 'Added: ' + label + ' — $' + amount.toFixed(2) + '. It counts in every total now.';
  });
}

// --- goals: contribute to a goal, or create a new one.
function wireGoals() {
  for (const form of app.querySelectorAll('.contribute-form')) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const goal = state.goals.find((g) => g.id === form.dataset.goal);
      const box = form.querySelector('input');
      const amount = Number(box.value);
      if (!goal || !amount || amount <= 0) return;
      goal.saved = Math.min(goal.target, goal.saved + amount);
      saveState(state);
      render();
    });
  }

  const form = document.getElementById('goal-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const label = document.getElementById('goal-label').value.trim();
      const target = Number(document.getElementById('goal-target').value);
      const date = document.getElementById('goal-date').value.trim();
      const note = document.getElementById('goal-note');
      if (!label || !target || target <= 0 || !date) {
        if (note) note.textContent = 'Give the goal a name, a target amount and a target date.';
        return;
      }
      state.goals.push({ id: 'g' + Date.now(), label, target, saved: 0, targetDate: date, note: 'Added by the household.' });
      saveState(state);
      render();
      const after = document.getElementById('goal-note');
      if (after) after.textContent = 'Goal created: ' + label + ' — $' + target.toLocaleString('en-US') + ' by ' + date + '.';
    });
  }
}

// Re-wire the controls of whichever page just rendered.
function wirePage() {
  wirePlanner();
  wireExpenseForm();
  wireGoals();
}

// Render on load and whenever the hash changes; a hash link is how every
// page of the site is reached.
window.addEventListener('hashchange', render);
render();
