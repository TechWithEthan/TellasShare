// Run instantly before page loads anything
(function () {
  const ua = navigator.userAgent;
  const mobileRe = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i;
  const hasTouch = navigator.maxTouchPoints > 1;
  const isNarrow = window.innerWidth < 1024;
  const isMobile = mobileRe.test(ua) || (hasTouch && isNarrow);

  if (!isMobile) return;

  // Inject block styles instantly into <head> before DOM renders
  const style = document.createElement("style");
  style.textContent = `
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
      background: #f5f5f5;
      font-family: sans-serif;
    }
    #__block {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      z-index: 99999;
      text-align: center;
      padding: 2rem;
    }
    #__block .icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #FCEBEB;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }
    #__block h2 {
      font-size: 20px;
      font-weight: 500;
      margin: 0 0 0.5rem;
      color: #111;
    }
    #__block p {
      font-size: 14px;
      color: #666;
      margin: 0;
      line-height: 1.6;
    }
  `;
  document.head.appendChild(style);

  // Inject block screen div instantly
  const block = document.createElement("div");
  block.id = "__block";
  block.innerHTML = `
    <div>
      <div class="icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="#A32D2D" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
      </div>
      <h2>Desktop only</h2>
      <p>This page requires a desktop computer.<br>Please switch devices to continue.</p>
    </div>
  `;

  // Append as soon as <body> exists, or wait for it
  if (document.body) {
    document.body.appendChild(block);
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      document.body.appendChild(block);
    });
  }

  // Hide all other body children so nothing flashes behind the block
  document.addEventListener("DOMContentLoaded", function () {
    Array.from(document.body.children).forEach(function (el) {
      if (el.id !== "__block") el.style.display = "none";
    });
  });
})();