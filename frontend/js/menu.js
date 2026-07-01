/* ── Hamburger Side Menu ─────────────────────────────────────────────────────
   Injects the drawer + overlay into every page. No dependencies.
   ────────────────────────────────────────────────────────────────────────── */

(function () {

  function init() {
    injectHTML();
    hookClose();
  }

  function injectHTML() {
    // ── Overlay backdrop ──
    const overlay = document.createElement('div');
    overlay.id = 'menu-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.addEventListener('click', closeMenu);

    // ── Drawer ──
    const drawer = document.createElement('nav');
    drawer.id = 'menu-drawer';
    drawer.setAttribute('role', 'navigation');
    drawer.setAttribute('aria-label', 'Site menu');
    drawer.innerHTML = `
    <div class="menu-header">
        <span class="menu-logo">Signovate</span>
        <button class="menu-close-btn" onclick="closeMenu()" aria-label="Close">✕</button>
    </div>
    <ul class="menu-list">
        <li><a href="index.html" class="menu-item" id="mnav-home">🏠 Home</a></li>
        <li><a href="chapters.html" class="menu-item" id="mnav-chapters">📚 Chapters</a></li>
        <li><a href="handmade-test.html" class="menu-item" id="mnav-handmade">🎯 Custom Test</a></li>
        <li><a href="#"            class="menu-item" id="mnav-ranking">🌐 Global Leagues</a></li>
        <li><a href="#"             class="menu-item" id="mnav-profile">👤 View Profile</a></li>
        <li><a href="#"            class="menu-item" id="mnav-settings">⚙️ Settings</a></li>

    </ul>
    <div class="menu-footer">Signly v1.0</div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    // Highlight current page
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.menu-item').forEach(el => {
      if (el.getAttribute('href') === path) el.classList.add('menu-item-active');
    });
  }

  function hookClose() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    checkHandmadeTestLock();
  }

  function checkHandmadeTestLock() {
    // Check if all 3 modules (basic words, phrases, sentences) of chapter 1 are complete
    const chapterDone = localStorage.getItem('chapter_1_complete') === 'true';
    const handmadeBtn = document.getElementById('mnav-handmade');
    const profile=document.getElementById('mnav-profile')
    const ranking=document.getElementById('mnav-ranking')
    const settings=document.getElementById('mnav-settings')
    if (handmadeBtn && !chapterDone) {
      handmadeBtn.classList.add('locked');
      handmadeBtn.title = 'Full Version - Coming soon!!';
      handmadeBtn.style.opacity = '0.4';
      handmadeBtn.style.cursor = 'not-allowed';
      handmadeBtn.onclick = function(e) {
        e.preventDefault();
        return false;
      };
    }
    if (ranking) {
      ranking.classList.add('locked');
      ranking.title = 'Full Version - Coming soon!!';
      ranking.style.opacity = '0.4';
      ranking.style.cursor = 'not-allowed';
      ranking.onclick = function(e) {
        e.preventDefault();
        return false;
      };
    }
    if (profile) {
      profile.classList.add('locked');
      profile.title = 'Full Version - Coming soon!!';
      profile.style.opacity = '0.4';
      profile.style.cursor = 'not-allowed';
      profile.onclick = function(e) {
        e.preventDefault();
        return false;
      };
    }
    if (settings) {
      settings.classList.add('locked');
      settings.title = 'Full Version - Coming soon!!';
      settings.style.opacity = '0.4';
      settings.style.cursor = 'not-allowed';
      settings.onclick = function(e) {
        e.preventDefault();
        return false;
      };
    }
  }

  window.openMenu = function () {
    document.getElementById('menu-overlay').classList.add('open');
    document.getElementById('menu-drawer').classList.add('open');
    document.body.classList.add('menu-open');
  };

  window.closeMenu = function () {
    document.getElementById('menu-overlay').classList.remove('open');
    document.getElementById('menu-drawer').classList.remove('open');
    document.body.classList.remove('menu-open');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();