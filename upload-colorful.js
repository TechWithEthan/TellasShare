// ── Colorful typing effect ──────────────────────────────────────────────
(function () {
  const COLOR_PALETTE = ['#ff6ec7','#ff9f5e','#ffe07d','#7dffd0','#7dcfff','#c97dff'];
  let gradAngle = 0;
  let colorRaf = null;

  function getColorGradient(angle) {
    const stops = COLOR_PALETTE
      .map((c, i) => `${c} ${(i / (COLOR_PALETTE.length - 1)) * 100}%`)
      .join(', ');
    return `linear-gradient(${angle}deg, ${stops})`;
  }

  function animateColorLoop() {
    gradAngle = (gradAngle + 0.4) % 360;
    const grad = getColorGradient(gradAngle);
    document.querySelectorAll('#textInput, #codeInput').forEach(ta => {
      if (ta.value.length > 0) {
        ta.style.webkitBackgroundClip = 'text';
        ta.style.backgroundClip = 'text';
        ta.style.webkitTextFillColor = 'transparent';
        ta.style.backgroundImage = grad;
      }
    });
    colorRaf = requestAnimationFrame(animateColorLoop);
  }

  function initColorTyping(textarea) {
    textarea.addEventListener('input', () => {
      if (textarea.value.length > 0) {
        if (!colorRaf) animateColorLoop();
      } else {
        textarea.style.backgroundImage = 'none';
        textarea.style.webkitTextFillColor = '';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#textInput, #codeInput').forEach(initColorTyping);
  });
})();
// ────────────────────────────────────────────────────────────────────────