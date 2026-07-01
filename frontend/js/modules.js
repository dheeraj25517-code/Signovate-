function initModules() {
  const params     = new URLSearchParams(window.location.search);
  const chapterId  = parseInt(params.get('chapter')) || 1;

  // Only modules belonging to this chapter
  const chapterModules = modules.filter(m => (m.chapter_id || 1) === chapterId);

  updateStats(chapterModules);
  renderModules(chapterModules, chapterId);
}

function updateStats(chapterModules) {
  const modulesDone = chapterModules.filter(
    m => m.progress === m.signs.length && m.signs.length > 0
  ).length;

  const doneEl = document.getElementById('modules-done');
  if (doneEl) doneEl.textContent = modulesDone + ' / ' + chapterModules.length;

  // signs-done now lives on About You page — update only if element exists
  const signsEl = document.getElementById('signs-done');
  if (signsEl) {
    const signsDone = chapterModules.reduce((t, m) => t + m.progress, 0);
    signsEl.textContent = signsDone;
  }
  const signsLearnedEl = document.getElementById('signs-learned');
  if (signsLearnedEl) {
    signsLearnedEl.textContent = chapterModules.reduce((t, m) => t + m.progress, 0);
  }
}

function renderModules(chapterModules, chapterId) {
  const list = document.getElementById('modules-list');
  if (!list) return;

  list.innerHTML = chapterModules.map((mod) => {
    const globalIndex   = modules.indexOf(mod);
    const posInChapter  = chapterModules.indexOf(mod);

    const total = mod.signs.length;
    const done  = mod.progress;
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

    // A module is unlocked only if every module before it in the chapter is complete
    const prevComplete = posInChapter === 0
      || chapterModules[posInChapter - 1].progress >= chapterModules[posInChapter - 1].signs.length;

    const isLocked  = !prevComplete;
    const isDone    = done === total && total > 0;
    const isCurrent = !isLocked && !isDone;

    const badgeText  = isDone ? 'Done'
      : isCurrent && done > 0 ? 'In progress'
      : isCurrent ? 'Begin'
      : 'Coming soon';
    const badgeClass = isDone ? 'badge-done' : isCurrent ? 'badge-current' : 'badge-locked';
    const cardClass  = isLocked ? 'locked' : isDone ? '' : 'current';
    const clickAttr  = !isLocked
      ? `onclick="goToLesson(${globalIndex}, ${chapterId})"` : '';

    return `
      <div class="module-card ${cardClass}" ${clickAttr}>
        <div class="module-emoji">${mod.emoji}</div>
        <div class="module-info">
          <div class="module-name">${mod.name}</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>
          <div class="module-meta">${done} / ${total} signs complete</div>
        </div>
        <span class="badge ${badgeClass}">${badgeText}</span>
      </div>
    `;
  }).join('');
}

function goToLesson(moduleIndex, chapterId) {
  window.location.href = `lesson.html?module=${moduleIndex}&sign=0&chapter=${chapterId}`;
}

window.initModules = initModules;