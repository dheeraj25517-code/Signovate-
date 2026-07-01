/* ── stats.js ────────────────────────────────────────────────────────────────
   Single source of truth for trophies + diamonds.
   Load on every page EXCEPT lesson.html and quiz.html.
   Always load BEFORE completion.js so awardTrophies/awardDiamonds are defined
   when completion.js needs them.
   ─────────────────────────────────────────────────────────────────────────── */

/* ── Read helpers ── */
function getTrophies() {
  return parseInt(localStorage.getItem('total_trophies') || '0');
}
function getDiamonds() {
  return parseInt(localStorage.getItem('total_diamonds') || '0');
}

/* ── Write + immediately refresh topbar ── */
function awardTrophies(count) {
  localStorage.setItem('total_trophies', getTrophies() + count);
  refreshTopbarStats();
}

function awardDiamonds(count) {
  localStorage.setItem('total_diamonds', getDiamonds() + count);
  refreshTopbarStats();
}

/* ── Push current values into whatever spans exist on this page ── */
function setStatWithPop(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  const container = el.closest('.topbar-stat');
  el.textContent = value;
  if (container) {
    container.classList.remove('pop');
    void container.offsetWidth;
    container.classList.add('pop');
  }
}

function refreshTopbarStats() {
  setStatWithPop('trophies-count', getTrophies());
  setStatWithPop('diamonds-count', getDiamonds());
  const homeStreakEl   = document.getElementById('home-streak');
  const homeDiamondsEl = document.getElementById('home-diamonds');
  const homeTrophiesEl = document.getElementById('home-trophies');
  if (homeDiamondsEl) homeDiamondsEl.textContent = getDiamonds();
  if (homeTrophiesEl) homeTrophiesEl.textContent = getTrophies();
}

// Run on every page load so topbar starts with correct values
document.addEventListener('DOMContentLoaded', refreshTopbarStats);

/* ── Expose globally ── */
window.getTrophies        = getTrophies;
window.getDiamonds        = getDiamonds;
window.awardTrophies      = awardTrophies;
window.awardDiamonds      = awardDiamonds;
window.refreshTopbarStats = refreshTopbarStats;