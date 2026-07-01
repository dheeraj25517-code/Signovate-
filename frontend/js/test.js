function initTest() {
  const params     = new URLSearchParams(window.location.search);
  const chapterId  = parseInt(params.get('chapter')) || 1;

  const chapterModules = modules.filter(m => m.chapter_id === chapterId || (chapterId === 1 && !m.chapter_id));
  const allSigns = chapterModules.flatMap(m => m.signs || []);
  
  // Chapter Test constraints requirement: selects questions randomly and generates 7 questions
  const pool = allSigns.sort(() => Math.random() - 0.5).slice(0, 7);

  let currentIndex = 0;
  let score        = 0;

  function renderQuestion() {
    if (pool.length === 0) {
       alert("No signs inside chapter repository found to execute validation.");
       return;
    }
    const current = pool[currentIndex];

    const countEl = document.getElementById('quiz-count');
    if (countEl) countEl.textContent = (currentIndex + 1) + ' / ' + pool.length;

    const wrong = allSigns
      .filter(s => s.word !== current.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [...wrong, current].sort(() => Math.random() - 0.5);

    const video = document.getElementById('quiz-video');
    if (video) {
      video.src = current.video;
      video.load();
      video.play().catch(() => {});
    }

    const grid = document.getElementById('quiz-grid');
    grid.innerHTML = '';
    const feedback = document.getElementById('feedback');
    feedback.className = 'feedback';
    feedback.textContent = '';

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.style.display = 'none';

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.textContent = opt.word;
      btn.onclick = () => {
        Array.from(grid.children).forEach(b => b.disabled = true);
        const isCorrect = opt.word === current.word;
        if (isCorrect) {
          score++;
          btn.classList.add('correct');
          feedback.textContent = '🎉 Correct!';
          feedback.classList.add('correct');
        } else {
          btn.classList.add('wrong');
          feedback.textContent = `❌ Incorrect. Correct was: ${current.word}`;
          feedback.classList.add('wrong');
        }
        if (nextBtn) nextBtn.style.display = 'block';
      };
      grid.appendChild(btn);
    });
  }

  window.nextQuestion = function () {
    currentIndex++;
    if (currentIndex < pool.length) {
      renderQuestion();
    } else {
      const accuracy = Math.round((score / pool.length) * 100);
      
      // FIXED: Trophy threshold rules applied
      let trophies = 1;
      if (accuracy >= 85) trophies = 3;
      else if (accuracy >= 50) trophies = 2;

      const existingT = parseInt(localStorage.getItem('total_trophies') || '0');
      localStorage.setItem('total_trophies', existingT + trophies);
      
      // FIXED: Sets localStorage key on finish to unlock Hand-made Tests
      localStorage.setItem(`chapter_${chapterId}_complete`, 'true');

      showTestResults(accuracy, trophies);
    }
  };

  window.goBack = function () {
    window.location.href = `index.html?chapter=${chapterId}`;
  };

  function showTestResults(accuracy, trophies) {
    const container = document.querySelector('.container');
    container.innerHTML = `
      <div class="complete-screen">
        <div class="complete-icon">📊</div>
        <h1 class="complete-title">Chapter Test Complete!</h1>\
        <p class="complete-sub">You scored ${accuracy}%</p>
        
        <div class="trophy-row" style="margin-bottom: 20px;">
          <div class="trophy-list" id="trophy-list"></div>\
          <p class="accuracy-text">Accuracy: ${accuracy}%</p>
        </div>
        <button class="primary-btn" onclick="window.location.href='chapters.html'">Back to chapters</button>
      </div>
    `;

    const trophy_list = document.getElementById('trophy-list');
    if (trophy_list) {
      for (let i = 0; i < trophies; i++) {
        const trophy = document.createElement('span');
        trophy.className = 'trophy-icon';
        trophy.textContent = '🏆';
        trophy_list.appendChild(trophy);
      }
    }
  }

  renderQuestion();
}

window.initTest = initTest;