/* ── streak.js ───────────────────────────────────────────────────────────────
   Single source of truth for the streak calendar modal.
   All IDs and class names match exactly what is in style.css on disk:
     overlay:       #streak-overlay
     modal grid:    #cal-grid
     month title:   #cal-month-title
     timer:         #cal-timer  (inside .cal-day-label)
     streak cards:  #streak-current-val, #streak-best-val
     hearts:        #hearts-val, #hearts-next, #hearts-bar-fill
   ─────────────────────────────────────────────────────────────────────────── */

(function () {

  /* ── state ── */
  let calendarYear  = new Date().getFullYear();
  let calendarMonth = new Date().getMonth();
  let streakData    = null;
  let timerInterval = null;

  /* ── bootstrap ── */
  function init() {
    injectModal();      // build modal DOM once, append to body
    hookTopbar();       // make .streak badge clickable
    loadStreak();       // fetch data then render
  }

  /* ── data fetch ── */
  async function loadStreak() {
    try {
      streakData = (typeof getStreak === 'function')
        ? await getStreak()
        : fallback();
    } catch (_) {
      streakData = fallback();
    }
    renderAll();
  }

  function fallback() {
    const today = new Date();
    const fmt   = d => d.toISOString().slice(0, 10);
    const days  = [8, 11, 15, 17, 22, 23, 24, 25]
      .map(n => new Date(today.getFullYear(), today.getMonth(), n))
      .filter(d => d <= today)
      .map(fmt);
    return { current_streak: 1, best_streak: 2, active_dates: days,
             today_done: false, hearts: 1, hearts_to_next: 4 };
  }

  /* ── render all ── */
  function renderAll() {
    if (!streakData) return;
    // Topbar badge
    const sc = document.getElementById('streak-count');
    if (sc) sc.textContent = streakData.current_streak;
    // Everything inside the modal
    renderCalendar();
    renderStreakCards();
    renderHearts();
    startTimer();
    const homeStreakEl = document.getElementById('home-streak');
  if (homeStreakEl) homeStreakEl.textContent = streakData.current_streak;
  }

  /* ── calendar grid ── */
  function renderCalendar() {
    const titleEl = document.getElementById('cal-month-title');
    const gridEl  = document.getElementById('cal-grid');
    if (!titleEl || !gridEl) return;

    const MONTHS = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    titleEl.textContent = MONTHS[calendarMonth] + ' ' + calendarYear;

    const today     = new Date();
    const todayStr  = today.toISOString().slice(0, 10);
    const activeSet = new Set(streakData.active_dates || []);

    const firstDay  = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMon = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    // Day-of-week headers (use .cal-hdr — styled in CSS)
    let html = ['S','M','T','W','T','F','S']
      .map(d => `<div class="cal-hdr">${d}</div>`).join('');

    // Leading blank cells
    for (let i = 0; i < firstDay; i++) html += `<div></div>`;

    for (let d = 1; d <= daysInMon; d++) {
      const mm      = String(calendarMonth + 1).padStart(2, '0');
      const dd      = String(d).padStart(2, '0');
      const dateStr = `${calendarYear}-${mm}-${dd}`;
      const dt      = new Date(calendarYear, calendarMonth, d);

      const isToday  = dateStr === todayStr;
      const isActive = activeSet.has(dateStr);
      const isFuture = dt > today && !isToday;
      const isPast   = dt < today && !isToday;

      // Priority: today > active > missed > future
      let cls = 'cal-day';
      if (isToday)       cls += ' cal-today';
      else if (isActive) cls += ' cal-active';
      else if (isPast)   cls += ' cal-missed';
      else if (isFuture) cls += ' cal-future';

      const mark = (!isFuture && !isToday)
        ? `<span class="cal-mark">${isActive ? '✓' : '✕'}</span>`
        : '';

      html += `<div class="${cls}"><span class="cal-day-num">${d}</span>${mark}</div>`;
    }

    gridEl.innerHTML = html;
  }

  /* ── streak cards ── */
  function renderStreakCards() {
    const cur  = document.getElementById('streak-current-val');
    const best = document.getElementById('streak-best-val');
    const fmt  = n => n + (n === 1 ? ' day' : ' days');
    if (cur)  cur.textContent  = fmt(streakData.current_streak);
    if (best) best.textContent = fmt(streakData.best_streak);
  }

  /* ── hearts ── */
  function renderHearts() {
    const hVal  = document.getElementById('hearts-val');
    const hNext = document.getElementById('hearts-next');
    const hBar  = document.getElementById('hearts-bar-fill');
    if (!hVal) return;

    const PER_LEVEL = 5;
    const toNext    = streakData.hearts_to_next ?? PER_LEVEL;
    const done      = PER_LEVEL - toNext;

    hVal.textContent = streakData.hearts;
    if (hNext) hNext.textContent = done + '/' + PER_LEVEL + ' to next';
    if (hBar)  hBar.style.width  = Math.round((done / PER_LEVEL) * 100) + '%';
  }

  /* ── countdown timer ── */
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    function tick() {
      const el = document.getElementById('cal-timer');
      if (!el) return;
      const now      = new Date();
      const midnight = new Date(now); midnight.setHours(24, 0, 0, 0);
      const diff     = midnight - now;
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      el.textContent = `${h}:${m}:${s} left`;
    }

    tick();
    timerInterval = setInterval(tick, 1000);
  }

  /* ── month navigation ── */
  function prevMonth() {
    calendarMonth--;
    if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
    renderCalendar();
  }
  function nextMonth() {
    calendarMonth++;
    if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
    renderCalendar();
  }

  /* ── open / close ── */
  function openCalendar() {
    const overlay = document.getElementById('streak-overlay');
    if (!overlay) return;
    overlay.classList.add('open');
    calendarYear  = new Date().getFullYear();
    calendarMonth = new Date().getMonth();
    loadStreak();
  }

  function closeCalendar() {
    const overlay = document.getElementById('streak-overlay');
    if (overlay) overlay.classList.remove('open');
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  /* ── hook topbar .streak click ── */
  function hookTopbar() {
    const el = document.querySelector('.streak');
    if (el) {
      el.style.cursor = 'pointer';
      el.title = 'View streak calendar';
      el.addEventListener('click', openCalendar);
    }
  }

  /* ── inject modal HTML once ── */
  function injectModal() {
    if (document.getElementById('streak-overlay')) return; // already injected

    const overlay = document.createElement('div');
    overlay.id = 'streak-overlay';

    // Close when clicking the dark backdrop
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeCalendar();
    });

    overlay.innerHTML = `
      <div class="streak-modal" role="dialog" aria-modal="true" aria-label="Streak calendar">

        <button class="streak-close" onclick="window.closeStreakCalendar()" aria-label="Close">✕</button>

        <!-- Month nav + timer -->
        <div class="cal-nav">
          <button class="cal-nav-btn" onclick="window.streakPrevMonth()">&#8249;</button>
          <div style="text-align:center">
            <div class="cal-month-title" id="cal-month-title"></div>
            <div class="cal-day-label">
              Day ${new Date().getDate()}
              &nbsp;
              <span id="cal-timer"></span>
            </div>
          </div>
          <button class="cal-nav-btn" onclick="window.streakNextMonth()">&#8250;</button>
        </div>

        <!-- Calendar grid — headers + day cells injected by renderCalendar() -->
        <div class="cal-grid" id="cal-grid"></div>

        <!-- Streak summary cards -->
        <div class="streak-cards">
          <div class="streak-card">
            <div class="streak-card-title">Current Streak</div>
            <div class="streak-card-body">
              <span class="streak-icon streak-fire">🔥</span>
              <span id="streak-current-val">0 days</span>
            </div>
          </div>
          <div class="streak-card">
            <div class="streak-card-title">Best Streak</div>
            <div class="streak-card-body">
              <span class="streak-icon streak-trophy">🏆</span>
              <span id="streak-best-val">0 days</span>
            </div>
          </div>
        </div>

        <!-- Hearts progress -->
        <div class="hearts-row">
          <span class="hearts-icon">❤️</span>
          <span class="hearts-val" id="hearts-val">0</span>
          <span class="hearts-next" id="hearts-next">0/5 to next</span>
          <div class="hearts-bar">
            <div class="hearts-bar-fill" id="hearts-bar-fill"></div>
          </div>
        </div>

        <div class="streak-hint">Complete at least one sign a day to keep your streak</div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  /* ── global handles ── */
  window.openStreakCalendar  = openCalendar;
  window.closeStreakCalendar = closeCalendar;
  window.streakPrevMonth     = prevMonth;
  window.streakNextMonth     = nextMonth;

  /* ── auto-init ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();