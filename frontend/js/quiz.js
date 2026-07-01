function initQuiz() {
  const params      = new URLSearchParams(window.location.search);
  const moduleIndex = parseInt(params.get('module'))     || 0;
  const groupStart  = parseInt(params.get('groupStart')) || 0;
  const groupEnd    = parseInt(params.get('groupEnd'))   || 0;
  const nextSign    = parseInt(params.get('nextSign'))   || 0;
  const chapterId   = parseInt(params.get('chapter'))    || 1;

  const mod   = modules[moduleIndex] || { signs: [] };
  const total = mod.signs.length;

  // Build question pool from this group (non-retry questions only)
  const isLastGroup = nextSign >= total;
  const fullGroup   = mod.signs.slice(groupStart, groupEnd + 1);
  const pool        = isLastGroup
    ? [...mod.signs].sort(() => Math.random() - 0.5).slice(0, 5)
    : [...fullGroup].sort(() => Math.random() - 0.5).slice(0, 3);

  let currentIndex  = 0;
  let score         = 0;   // counts only original-pool correct answers
  let mistakeQueue  = [];  // signs the user got wrong — must answer correctly twice
  let correctStreak = {};  // word → consecutive correct answers since mistake
  let inRetryMode   = false;

  function renderQuestion(overrideSign, isRetry) {
    inRetryMode = !!isRetry;
    const current = overrideSign || pool[currentIndex];

    // Topbar count
    const countEl = document.getElementById('quiz-count');
    if (countEl) {
      countEl.textContent = isRetry
        ? 'RETRY: ' + current.word
        : (currentIndex + 1) + ' / ' + pool.length;
    }

    // Retry banner toggle
    const retryLabel = document.getElementById('retry-label');
    if (retryLabel) retryLabel.style.display = isRetry ? 'block' : 'none';

    // 4 options: 1 correct + up to 3 wrong from same module
    const wrong = mod.signs
      .filter(s => s.word !== current.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [...wrong, current].sort(() => Math.random() - 0.5);

    if (options.length < 2) {
      console.warn('Not enough signs in this module to quiz meaningfully — skipping.');
      nextQuestion();
      return;
    }

    /* ── Quiz video ─────────────────────────────────────────────────────────
       Routes through the backend's /stream-video endpoint (see main.py),
       which supports HTTP byte-range requests for smooth seeking/scrubbing.

       IMPORTANT: uses current.quizVideo (e.g.
       "assets/greetings/Quiz_videos/Hello.mp4") — the DEDICATED quiz-folder
       video — not current.video (the lesson video). current.quizVideo is
       populated by data.js from the backend's quiz_video_path column.

       Falls back to current.video only if quizVideo is missing for this
       sign, so nothing breaks if a quiz video hasn't been recorded yet.
    ───────────────────────────────────────────────────────────────────────── */
    const video = document.getElementById('quiz-video');
    if (video) {
      const relativePath = current.quizVideo || current.video;
      video.src = `http://localhost:8000/stream-video?path=${encodeURIComponent(relativePath)}`;
      video.load();
      video.play().catch((err) => {
        console.warn('Video autoplay blocked or failed:', err);
      });
    }

    // Option buttons
    const grid = document.getElementById('quiz-grid');
    if (grid) {
      grid.innerHTML = options.map(opt =>
        `<div class="quiz-opt" data-word="${opt.word}">${opt.word}</div>`
      ).join('');
      grid.querySelectorAll('.quiz-opt').forEach(el => {
        el.addEventListener('click', function () {
          checkAnswer(this, this.dataset.word, current.word, isRetry);
        });
      });
    }

    // Reset feedback + next button
    const fb = document.getElementById('feedback');
    if (fb) { fb.className = 'feedback'; fb.textContent = ''; }
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.style.display = 'none';
  }

  function checkAnswer(el, chosen, correct, isRetry) {
    document.querySelectorAll('.quiz-opt').forEach(o => o.classList.add('disabled'));
    const fb = document.getElementById('feedback');

    if (chosen === correct) {
      el.classList.add('correct');
      el.classList.remove('disabled');
      const praise = ['Nice one! 🎉', 'You got it!', "That's right ✓", 'Well done!', 'Nailed it!'];
      if (fb) { fb.textContent = praise[Math.floor(Math.random() * praise.length)]; fb.className = 'feedback good show'; }

      if (!isRetry) {
        score++;
      } else {
        correctStreak[correct] = (correctStreak[correct] || 0) + 1;
        if (correctStreak[correct] >= 2) {
          mistakeQueue = mistakeQueue.filter(s => s.word !== correct);
          delete correctStreak[correct];
        }
      }
    } else {
      el.classList.add('wrong');
      document.querySelectorAll('.quiz-opt').forEach(o => {
        if (o.dataset.word === correct) {
          o.classList.add('correct');
          o.classList.remove('disabled');
        }
      });

      const encourage = [
        'Not quite — it was "' + correct + '"',
        'Close! The answer was "' + correct + '"',
        'Almost — that one was "' + correct + '"',
        'Good try — it\'s actually "' + correct + '"'
      ];
      if (fb) {
        fb.textContent = encourage[Math.floor(Math.random() * encourage.length)];
        fb.className = 'feedback bad show';
      }

      // Add to retry queue (only from original pool, and only once)
      if (!isRetry && !mistakeQueue.find(s => s.word === correct)) {
        const sign = pool.find(s => s.word === correct) || mod.signs.find(s => s.word === correct);
        if (sign) {
          mistakeQueue.push(sign);
          correctStreak[correct] = 0;
        }
      } else if (isRetry) {
        // Wrong again on retry — reset their streak and cycle to the back of the queue
        correctStreak[correct] = 0;
        if (mistakeQueue.length > 1) {
          const failedRetry = mistakeQueue.shift();
          mistakeQueue.push(failedRetry);
        }
      }
    }

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.style.display = 'block';
  }

  window.nextQuestion = function () {
    if (mistakeQueue.length > 0) {
      const retrySign = mistakeQueue[0];
      renderQuestion(retrySign, true);
      return;
    }

    currentIndex++;
    if (currentIndex < pool.length) {
      renderQuestion();
    } else if (nextSign >= total) {
      const accuracy = Math.round((score / pool.length) * 100);
      const trophies = accuracy >= 85 ? 3 : accuracy >= 50 ? 2 : 1;
      const diamonds = score + (trophies === 3 ? 5 : 0);

      const existingT = parseInt(localStorage.getItem('total_trophies') || '0');
      const existingD = parseInt(localStorage.getItem('total_diamonds') || '0');
      localStorage.setItem('total_trophies', existingT + trophies);
      localStorage.setItem('total_diamonds', existingD + diamonds);

      window.location.href =
        `completion.html?module=${moduleIndex}&chapter=${chapterId}&trophies=${trophies}&accuracy=${accuracy}`;
    } else {
      window.location.href =
        `lesson.html?module=${moduleIndex}&sign=${nextSign}&chapter=${chapterId}`;
    }
  };

  window.goBack = function () {
    const confirmed = confirm("Are you sure you want to leave this quiz?");
    if (confirmed) {
      window.location.href = `index.html?chapter=${chapterId}`;
    }
  };

  renderQuestion();
}
window.initQuiz = initQuiz;

function replayQuizVideo() {
  const video = document.getElementById('quiz-video');
  if (video) {
    video.currentTime = 0;
    video.play().catch(() => {});
  }
}
window.replayQuizVideo = replayQuizVideo;

setTimeout(() => {
  const menuLinks = document.querySelectorAll('#menu-drawer a, .menu-item');
  menuLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const destination = this.getAttribute('href');
      const confirmed = confirm("Are you sure you want to leave this quiz?");
      if (confirmed) {
        window.location.href = destination;
      }
    });
  });
}, 100);