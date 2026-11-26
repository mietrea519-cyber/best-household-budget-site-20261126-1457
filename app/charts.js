// Canvas charts, drawn with the browser's own 2D canvas — no library, no
// network. Both functions take a <canvas> that is already in the page and
// size it for the screen's pixel ratio so the picture stays crisp.

// A donut of spending by category, with the total in the middle.
function drawDonut(canvas, slices) {
  const ctx = canvas.getContext('2d');
  const ratio = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 320;
  const cssHeight = canvas.clientHeight || 320;
  canvas.width = cssWidth * ratio;
  canvas.height = cssHeight * ratio;
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const cx = cssWidth / 2;
  const cy = cssHeight / 2;
  const outer = Math.min(cssWidth, cssHeight) / 2 - 8;
  const inner = outer * 0.62;

  if (total <= 0) {
    ctx.fillStyle = '#d8d2c4';
    ctx.beginPath();
    ctx.arc(cx, cy, outer, 0, Math.PI * 2);
    ctx.arc(cx, cy, inner, 0, Math.PI * 2, true);
    ctx.fill();
    return;
  }

  let angle = -Math.PI / 2;
  for (const slice of slices) {
    const sweep = (slice.value / total) * Math.PI * 2;
    ctx.fillStyle = slice.color;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, angle, angle + sweep);
    ctx.closePath();
    ctx.fill();
    angle += sweep;
  }

  // Cut the hole and print the total in it.
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  ctx.fillStyle = '#24352c';
  ctx.textAlign = 'center';
  ctx.font = '700 ' + Math.round(inner * 0.34) + 'px Georgia, serif';
  ctx.fillText('$' + Math.round(total).toLocaleString('en-US'), cx, cy - 2);
  ctx.font = Math.round(inner * 0.2) + 'px system-ui, sans-serif';
  ctx.fillStyle = '#6b7280';
  ctx.fillText('spent so far', cx, cy + inner * 0.34);
}

// Vertical bars: one per month, income in green and spending in terracotta,
// drawn side by side with the month under each pair.
function drawMonthBars(canvas, months) {
  const ctx = canvas.getContext('2d');
  const ratio = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 640;
  const cssHeight = canvas.clientHeight || 260;
  canvas.width = cssWidth * ratio;
  canvas.height = cssHeight * ratio;
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const top = 26;
  const bottom = cssHeight - 30;
  const max = Math.max(...months.map((m) => Math.max(m.income, m.spent)), 1);
  const slot = cssWidth / months.length;
  const barWidth = Math.min(26, slot * 0.28);

  ctx.strokeStyle = '#e3ddd0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = top + ((bottom - top) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(cssWidth, y);
    ctx.stroke();
  }

  months.forEach((m, i) => {
    const centre = slot * i + slot / 2;
    const incomeHeight = ((bottom - top) * m.income) / max;
    const spentHeight = ((bottom - top) * m.spent) / max;
    ctx.fillStyle = '#2f6b4f';
    ctx.fillRect(centre - barWidth - 3, bottom - incomeHeight, barWidth, incomeHeight);
    ctx.fillStyle = '#c2703d';
    ctx.fillRect(centre + 3, bottom - spentHeight, barWidth, spentHeight);
    ctx.fillStyle = '#4b5563';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(m.month, centre, cssHeight - 10);
  });

  ctx.fillStyle = '#2f6b4f';
  ctx.font = '600 12px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('■ Income', 4, 14);
  ctx.fillStyle = '#c2703d';
  ctx.fillText('■ Spent', 84, 14);
}

// Horizontal bars for the planner: planned amount against spent so far.
function drawPlanBars(canvas, rows) {
  const ctx = canvas.getContext('2d');
  const ratio = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 640;
  const rowHeight = 26;
  const cssHeight = rows.length * rowHeight + 8;
  canvas.width = cssWidth * ratio;
  canvas.height = cssHeight * ratio;
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const max = Math.max(...rows.map((r) => Math.max(r.plan, r.spent)), 1);
  const labelWidth = 120;
  const trackWidth = cssWidth - labelWidth - 70;

  rows.forEach((row, i) => {
    const y = 8 + i * rowHeight;
    ctx.fillStyle = '#24352c';
    ctx.font = '13px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(row.label, 0, y + 13);
    ctx.fillStyle = '#e9e4d8';
    ctx.fillRect(labelWidth, y + 2, trackWidth, 12);
    ctx.fillStyle = row.color;
    ctx.fillRect(labelWidth, y + 2, (trackWidth * Math.min(row.spent, max)) / max, 12);
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('$' + Math.round(row.spent) + ' / $' + Math.round(row.plan), labelWidth + trackWidth + 8, y + 13);
  });
}
