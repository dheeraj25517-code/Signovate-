function initLesson() {
  const params      = new URLSearchParams(window.location.search);
  const moduleIndex = parseInt(params.get('module')) || 0;
  const signIndex   = parseInt(params.get('sign'))   || 0;

  const mod   = modules[moduleIndex] || { signs: [] };
  const sign  = mod.signs[signIndex] || { word: '', video: '' };
  const total = mod.signs.length;

  const GROUP_SIZE = 5;

  // Topbar count
  const countEl = document.getElementById('lesson-count');
  if (countEl) countEl.textContent = (signIndex + 1) + ' / ' + total;

  // Word label
  const wordEl = document.getElementById('sign-word');
  if (wordEl) wordEl.textContent = sign.word;

  // Video Configured for Custom FastAPI Byte-Range Stream
  const video = document.getElementById('sign-video');
  if (video) {
    // Encodes the path string and streams via the backend on port 8000
    video.src = `http://localhost:8000/stream-video?path=${encodeURIComponent(sign.video)}`;
    video.loop = true;
    video.load();
    video.play().catch((err) => {
      console.warn("Autoplay blocked or stream interrupted:", err);
    });
  }

  // Previous button visibility
  const prevBtn = document.getElementById('prev-sign-btn');
  if (prevBtn) {
    if (signIndex === 0) {
      prevBtn.style.display = 'none';
    } else {
      prevBtn.style.display = 'block';
    }
  }

  // Progress dots
  const dotsEl = document.getElementById('step-dots');
  if (dotsEl) {
    dotsEl.innerHTML = mod.signs.map((_, i) => {
      let cls = 'dot';
      if (i < signIndex)       cls += ' done';
      else if (i === signIndex) cls += ' current';
      return `<div class="${cls}"></div>`;
    }).join('');
  }

  // Mark this lesson complete in backend (fire-and-forget)
  if (sign.id && typeof postProgressComplete === 'function') {
    postProgressComplete({ lesson_id: sign.id, module_id: mod.id }).catch(() => {});
  }
  // Record today as an active day for the streak calendar
  if (typeof recordStreak === 'function') {
    recordStreak().catch(() => {});
  }

  window.goBack = function () {
    const confirmed = confirm("Are you sure you want to leave this lesson?");
    if (confirmed) {
      const chapterId = parseInt(params.get('chapter')) || 1;
      window.location.href = `index.html?chapter=${chapterId}`;
    }
  };

  window.goToQuiz = function () {
    const chapterId  = parseInt(params.get('chapter')) || 1;
    const nextIndex  = signIndex + 1;
    const endOfGroup = nextIndex % GROUP_SIZE === 0 || nextIndex === total;

    if (endOfGroup) {
      const groupStart = signIndex - (signIndex % GROUP_SIZE);
      window.location.href =
        `quiz.html?module=${moduleIndex}&groupStart=${groupStart}&groupEnd=${signIndex}&nextSign=${nextIndex}&chapter=${chapterId}`;
    } else {
      window.location.href = `lesson.html?module=${moduleIndex}&sign=${nextIndex}&chapter=${chapterId}`;
    }
  };

  window.goToPrevSign = function () {
    const chapterId = parseInt(params.get('chapter')) || 1;
    window.location.href = `lesson.html?module=${moduleIndex}&sign=${signIndex - 1}&chapter=${chapterId}`;
  };
}

window.initLesson = initLesson;

// Fixed Global Call mapping for spacebar shortcuts
document.addEventListener('keyup', e => { 
  if (e.code === 'Space' && typeof window.goToQuiz === 'function') { 
    window.goToQuiz(); 
  } 
});

function replayVideo() {
  const video = document.getElementById('sign-video');
  if (video) {
    video.currentTime = 0;
    video.play().catch(() => {});
  }
}

setTimeout(() => {
  const menuLinks = document.querySelectorAll('#menu-drawer a, .menu-item');
  menuLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const destination = this.getAttribute('href'); 
      const confirmed = confirm("Are you sure you want to leave this lesson?");
      if (confirmed) {
        window.location.href = destination;
      }
    });
  });
}, 100);