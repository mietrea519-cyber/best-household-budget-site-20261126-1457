// Small formatting helpers, used by every view so a dollar always looks
// the same: $1,234.56, never 1234.56 or $1234.56.
function money(amount) {
  const value = Number(amount) || 0;
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function moneyWhole(amount) {
  const value = Number(amount) || 0;
  return '$' + Math.round(value).toLocaleString('en-US');
}

function pct(part, whole) {
  if (!whole) return '0%';
  return Math.round((part / whole) * 100) + '%';
}

// "2026-11-24" -> "Mon 24 Nov"
function niceDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return days[d.getDay()] + ' ' + day + ' ' + months[d.getMonth()];
}

// Escape text that a person typed (expense labels, goal names) before it is
// put into the page, so a stray "<" never becomes markup.
function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
