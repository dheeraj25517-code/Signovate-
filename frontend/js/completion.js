function initCompletion() {
  const params      = new URLSearchParams(window.location.search);
  const moduleIndex = parseInt(params.get('module'))   || 0;
  const chapterId   = parseInt(params.get('chapter'))  || 1;
  const trophies    = parseInt(params.get('trophies')) || 0;
  const accuracy    = parseInt(params.get('accuracy')) || 0;

  const mod = modules[moduleIndex];

  // ── Title + subtitle ──────────────────────────────────────────────────────
  if (!mod) {
    document.getElementById('complete-title').textContent = 'Module Complete!';
    document.getElementById('complete-sub').textContent   = 'Great work!';
  } else {
    document.getElementById('complete-title').textContent = mod.name + ' Complete!';
    document.getElementById('complete-sub').textContent   =
      "You've learned all " + mod.signs.length + " signs in this module.";
  }

  // ── Trophy display ────────────────────────────────────────────────────────
  if (trophies > 0) {
    const trophyRow = document.getElementById('trophy-row');
    if (trophyRow) {
      trophyRow.style.display = 'block';

      const list = document.getElementById('trophy-list');
      if (list) {
        list.innerHTML = '';
        for (let i = 0; i < 3; i++) {
          const span = document.createElement('span');
          span.textContent = '🏆';
          if (i < trophies) {
            // Earned — animate in with staggered delay
            span.className = 'trophy-icon';
            span.style.animationDelay = (i * 0.15) + 's';
          } else {
            // Not earned — greyed out, no animation
            span.className = 'trophy-icon dim';
          }
          list.appendChild(span);
        }
      }

      const accEl = document.getElementById('accuracy-text');
      if (accEl) accEl.textContent = 'Accuracy: ' + accuracy + '%';
    }

    // ── Update topbar NOW on this page (stats.js must be loaded first) ──────
    if (typeof refreshTopbarStats === 'function') {
      refreshTopbarStats();
    }
  }

  // ── Chapter test unlock: show button if all modules in chapter are done ───
  const allInChapter = modules.filter(
    m => m.chapter_id === chapterId || (chapterId === 1 && !m.chapter_id)
  );
  const allComplete = allInChapter.length > 0 &&
    allInChapter.every(m => m.progress >= m.signs.length);

  const testBtn = document.getElementById('chapter-test-btn');
  if (testBtn && allComplete) testBtn.style.display = 'block';

  // ── Navigation ────────────────────────────────────────────────────────────
  window.goHome = function () {
    window.location.href = 'index.html?chapter=' + chapterId;
  };

  window.practiceAgain = function () {
    window.location.href =
      'lesson.html?module=' + moduleIndex + '&sign=0&chapter=' + chapterId;
  };

  window.takeChapterTest = function () {
    window.location.href = 'test.html?chapter=' + chapterId;
  };
}

// data.js calls this once modules array is ready
window.initCompletion = initCompletion;