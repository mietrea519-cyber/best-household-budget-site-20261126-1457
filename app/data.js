// The Hartley household's budget figures for November 2026.
// Every number on the site comes from this file; the planner edits it in
// memory and the browser saves those edits on this device only.
const HOUSEHOLD = {
  name: 'The Hartley household',
  members: ['Maya (teacher)', 'Jon (electrician)', 'Priya (age 9)', 'Sam (age 6)'],
  month: 'November 2026',
  currency: 'USD',
};

const INCOME_SOURCES = [
  { id: 'maya-pay', label: "Maya's teaching salary", amount: 3850, note: 'Paid on the 1st and 15th' },
  { id: 'jon-pay', label: "Jon's electrical work", amount: 2700, note: 'Weekly, varies with jobs' },
  { id: 'child-benefit', label: 'Child benefit', amount: 300, note: 'Paid on the 5th' },
];

// Monthly spending plan: each category has a planned amount and a colour
// used by the charts and the budget bars. Spent so far is derived from
// TRANSACTIONS, so the plan and the ledger always agree.
const CATEGORIES = [
  { id: 'housing', label: 'Housing', plan: 1650, color: '#2f6b4f', blurb: 'Mortgage, rates and home insurance.' },
  { id: 'groceries', label: 'Groceries', plan: 780, color: '#c2703d', blurb: 'Weekly shop, school lunches, pantry top-ups.' },
  { id: 'transport', label: 'Transport', plan: 420, color: '#4a7fa5', blurb: 'Fuel, bus passes and the car service fund.' },
  { id: 'utilities', label: 'Utilities', plan: 310, color: '#8a6fb8', blurb: 'Electricity, gas, water, internet and phones.' },
  { id: 'kids', label: 'Kids & school', plan: 360, color: '#c98a2e', blurb: 'After-school club, shoes, books and trips.' },
  { id: 'health', label: 'Health', plan: 240, color: '#5b8c5a', blurb: 'Prescriptions, dentist and the pharmacy.' },
  { id: 'fun', label: 'Fun & eating out', plan: 300, color: '#b84a62', blurb: 'One takeaway a week and a family day out.' },
  { id: 'household', label: 'Household', plan: 350, color: '#6b7c93', blurb: 'Cleaning, repairs, clothes and the odd fix.' },
  { id: 'giving', label: 'Giving', plan: 100, color: '#a05a7a', blurb: 'Birthday gifts and the food-bank tin.' },
  { id: 'other', label: 'Everything else', plan: 200, color: '#7a7a7a', blurb: 'The odds and ends that never fit a box.' },
];

// What the household has actually spent so far this month, newest first.
// Editing a category plan never touches these; adding an expense appends one.
const TRANSACTIONS = [
  { id: 't01', date: '2026-11-24', label: 'Weekly shop — GreenMart', category: 'groceries', amount: 148.20 },
  { id: 't02', date: '2026-11-23', label: 'Fuel — Route 9 station', category: 'transport', amount: 52.00 },
  { id: 't03', date: '2026-11-22', label: 'Sunday roast takeaway', category: 'fun', amount: 38.50 },
  { id: 't04', date: '2026-11-21', label: 'Priya — swimming lessons', category: 'kids', amount: 45.00 },
  { id: 't05', date: '2026-11-20', label: 'Electricity bill', category: 'utilities', amount: 132.40 },
  { id: 't06', date: '2026-11-19', label: 'Pharmacy — inhaler refill', category: 'health', amount: 24.60 },
  { id: 't07', date: '2026-11-18', label: 'Weekly shop — GreenMart', category: 'groceries', amount: 161.75 },
  { id: 't08', date: '2026-11-17', label: 'Bus passes (Maya & Jon)', category: 'transport', amount: 96.00 },
  { id: 't09', date: '2026-11-16', label: 'Sam — new school shoes', category: 'kids', amount: 42.99 },
  { id: 't10', date: '2026-11-15', label: 'Internet & phones', category: 'utilities', amount: 89.00 },
  { id: 't11', date: '2026-11-14', label: 'Cinema — family Saturday', category: 'fun', amount: 54.00 },
  { id: 't12', date: '2026-11-13', label: 'Mortgage payment', category: 'housing', amount: 1420.00 },
  { id: 't13', date: '2026-11-12', label: 'Weekly shop — GreenMart', category: 'groceries', amount: 139.90 },
  { id: 't14', date: '2026-11-11', label: 'Plumber — kitchen tap', category: 'household', amount: 85.00 },
  { id: 't15', date: '2026-11-10', label: 'Dentist check-up (Jon)', category: 'health', amount: 68.00 },
  { id: 't16', date: '2026-11-09', label: 'Fuel — Route 9 station', category: 'transport', amount: 48.50 },
  { id: 't17', date: '2026-11-08', label: 'Birthday gift — Gran', category: 'giving', amount: 35.00 },
  { id: 't18', date: '2026-11-07', label: 'Weekly shop — GreenMart', category: 'groceries', amount: 172.30 },
  { id: 't19', date: '2026-11-06', label: 'Water bill', category: 'utilities', amount: 61.20 },
  { id: 't20', date: '2026-11-05', label: 'School trip — Priya', category: 'kids', amount: 28.00 },
  { id: 't21', date: '2026-11-04', label: 'Takeaway — Friday pizza', category: 'fun', amount: 31.75 },
  { id: 't22', date: '2026-11-03', label: 'Home insurance (monthly)', category: 'housing', amount: 96.00 },
  { id: 't23', date: '2026-11-02', label: 'Cleaning supplies', category: 'household', amount: 41.30 },
  { id: 't24', date: '2026-11-01', label: 'Weekly shop — GreenMart', category: 'groceries', amount: 155.40 },
];

// What the household is saving for. "saved" moves when a contribution is
// added on the Goals page; the target date is the month they aim to reach it.
const SAVINGS_GOALS = [
  { id: 'g1', label: 'Emergency cushion', target: 3000, saved: 2140, targetDate: 'March 2027', note: 'Three months of essentials, for the month work goes quiet.' },
  { id: 'g2', label: 'Summer holiday — the coast', target: 1800, saved: 930, targetDate: 'June 2027', note: 'A week by the sea, train tickets included.' },
  { id: 'g3', label: 'New washing machine', target: 650, saved: 410, targetDate: 'January 2027', note: 'The old one rattles on spin. Replace before it floods the kitchen.' },
  { id: 'g4', label: 'Christmas fund', target: 500, saved: 500, targetDate: 'December 2026', note: 'Fully funded — presents, food and the tree, no January debt.' },
];

// The last six months, for the Insights page: what came in, what went out.
const MONTHLY_HISTORY = [
  { month: 'Jun 2026', income: 6720, spent: 5240 },
  { month: 'Jul 2026', income: 6910, spent: 5610 },
  { month: 'Aug 2026', income: 6580, spent: 5980 },
  { month: 'Sep 2026', income: 6850, spent: 5370 },
  { month: 'Oct 2026', income: 6790, spent: 5190 },
  { month: 'Nov 2026', income: 6850, spent: 3267 },
];

// Short, practical notes shown on the Insights page.
const MONEY_TIPS = [
  { title: 'Shop with a list, once a week', body: 'Groceries are the biggest flexible spend at $780 a month. One planned shop beats four top-up trips — the top-ups are where the treats sneak in.' },
  { title: 'Pay the goals first', body: 'Move $1,440 to savings on payday, before the month starts. What stays in the current account is what the month can spend.' },
  { title: 'One takeaway a week, not two', body: 'Fun money is $300 a month and the family enjoys the Friday pizza most. A second takeaway rarely adds joy, only cost.' },
  { title: 'Check the meter, not the bill', body: 'Utilities run $310 a month. A quick meter reading each Sunday catches a creeping tariff before the bill does.' },
];
