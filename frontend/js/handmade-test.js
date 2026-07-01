/* ── handmade-test.js ────────────────────────────────────────────────────────
   Drives the "Create Your Custom Test" builder page (handmade-test.html).
   On submit it stores the question pool in sessionStorage and navigates to
   handmade-test-run.html which runs the actual quiz.
   ─────────────────────────────────────────────────────────────────────────── */

function initHandmadeTest() {
  // Populate chapter checkboxes from loaded modules
  const chaptersBox = document.getElementById('chapters-checkboxes');
  if (chaptersBox && modules.length > 0) {
    const uniqueChapters = [...new Set(modules.map(m => m.chapter_id || 1))].sort();
    chaptersBox.innerHTML = uniqueChapters.map(chId => `
      <div class="checkbox-option">
        <input type="checkbox" id="chapter-${chId}" value="${chId}" checked>
        <label for="chapter-${chId}">Chapter ${chId}</label>
      </div>
    `).join('');
  }
}

window.toggleStep1Options = function () {
  const mode       = document.querySelector('input[name="test-mode"]:checked').value;
  const randomOpts = document.getElementById('random-options');
  const chapterOpts = document.getElementById('chapter-options');
  if (mode === 'random') {
    randomOpts.style.display  = 'block';
    chapterOpts.style.display = 'none';
  } else {
    randomOpts.style.display  = 'none';
    chapterOpts.style.display = 'block';
  }
};

window.startTest = function () {
  const mode = document.querySelector('input[name="test-mode"]:checked').value;
  let pool = [];

  if (mode === 'random') {
    const n       = Math.max(1, parseInt(document.getElementById('num-questions').value) || 10);
    const all     = modules.flatMap(m => m.signs || []);
    pool          = [...all].sort(() => Math.random() - 0.5).slice(0, n);
  } else {
    const selected = Array.from(
      document.querySelectorAll('#chapters-checkboxes input:checked')
    ).map(el => parseInt(el.value));

    const filtered = modules.filter(m => selected.includes(m.chapter_id || 1));
    const all      = filtered.flatMap(m => m.signs || []);
    pool           = [...all].sort(() => Math.random() - 0.5);
  }

  if (pool.length === 0) {
    alert('No signs available for this selection. Complete some modules first.');
    return;
  }

  sessionStorage.setItem('handmade_pool', JSON.stringify(pool));
  window.location.href = 'handmade-test-run.html';
};

window.goBack = function () {
  window.location.href = 'chapters.html';
};

// data.js calls window.initModules — override to call our init instead
window.initModules = function () {
  initHandmadeTest();
};

// If modules already loaded (shouldn't happen, but guard)
if (typeof modules !== 'undefined' && modules.length > 0) {
  initHandmadeTest();
}