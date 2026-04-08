function isMobileOrTablet() {
  const ua = navigator.userAgent;
  const mobileRe = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i;
  const hasTouch = navigator.maxTouchPoints > 1;
  const isNarrow = window.innerWidth < 1024;
  return mobileRe.test(ua) || (hasTouch && isNarrow);
}

function blockMobile() {
  if (!isMobileOrTablet()) return;

  document.body.style.cssText =
    "margin:0; display:flex; align-items:center;" +
    "justify-content:center; min-height:100vh;" +
    "font-family:sans-serif; background:#f5f5f5;";

  document.body.innerHTML = `
    <div style="text-align:center; padding:2rem; max-width:360px;">
      <div style="
        width:64px; height:64px; border-radius:50%;
        background:#FCEBEB; margin:0 auto 1.25rem;
        display:flex; align-items:center; justify-content:center;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="#A32D2D" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
      </div>
      <h2 style="font-size:20px; font-weight:500; margin:0 0 .5rem;">
        Desktop only
      </h2>
      <p style="font-size:14px; color:#666; margin:0;">
        This page requires a desktop computer.<br>
        Please switch devices to continue.
      </p>
    </div>`;
}

blockMobile();