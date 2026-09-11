(function () {
  var KEY = 'damouzo-theme';

  function currentTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    return t === 'day' ? 'day' : 'night';
  }

  function applyTheme(theme) {
    theme = theme === 'day' ? 'day' : 'night';
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    if (window.__initParticles) window.__initParticles(theme);
  }

  window.__themeApply = applyTheme;

  document.addEventListener('click', function (e) {
    var el = e.target;
    var btn = el && el.closest ? el.closest('.theme-toggle') : null;
    if (!btn) return;
    applyTheme(currentTheme() === 'day' ? 'night' : 'day');
  });
})();