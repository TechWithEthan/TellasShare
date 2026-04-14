// ─── TIMER ───
function getLaunchDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
}
let LAUNCH_DATE = getLaunchDate();

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

function buildCountdownUI() {
  const container = document.getElementById("cdUnits");
  if (!container) return;
  const units = [
    { id: "cd-days",  label: "Days" },
    { id: "cd-hours", label: "Hours" },
    { id: "cd-mins",  label: "Minutes" },
    { id: "cd-secs",  label: "Seconds" },
  ];
  container.innerHTML = "";
  units.forEach((u, i) => {
    if (i > 0) {
      const sep = document.createElement("div");
      sep.className = "cd-sep";
      sep.textContent = ":";
      container.appendChild(sep);
    }
    const unit = document.createElement("div");
    unit.className = "cd-unit";
    unit.innerHTML = `
      <div class="cd-box">
        <div class="cd-track">
          <div class="cd-digit" id="${u.id}">00</div>
        </div>
      </div>
      <div class="cd-label">${u.label}</div>
    `;
    container.appendChild(unit);
  });
}

function pad(n) { return String(n).padStart(2, "0"); }

function setDigit(id, newValue) {
  const el = document.getElementById(id);
  if (!el || el.textContent === newValue) return;
  el.classList.add("flip-out");
  setTimeout(() => {
    el.textContent = newValue;
    el.classList.remove("flip-out");
    el.classList.add("flip-in");
    setTimeout(() => el.classList.remove("flip-in"), 300);
  }, 150);
}

function updateCountdown() {
  const now = new Date();
  LAUNCH_DATE = getLaunchDate();
  const diff = LAUNCH_DATE - now;
  if (diff <= 0) {
    if (!isMobileDevice()) {
      window.location.href = "homepage for Computer.html";
    } else {
      const c = document.getElementById("cdUnits");
      if (c) c.innerHTML = '<div class="cd-launched">🚀 We\'ve launched! Mobile coming soon.</div>';
    }
    return;
  }
  setDigit("cd-days",  pad(Math.floor(diff / (1000 * 60 * 60 * 24))));
  setDigit("cd-hours", pad(Math.floor((diff / (1000 * 60 * 60)) % 24)));
  setDigit("cd-mins",  pad(Math.floor((diff / (1000 * 60)) % 60)));
  setDigit("cd-secs",  pad(Math.floor((diff / 1000) % 60)));
}

// ─── NOTIFY ───
async function submitNotify() {
  const emailInput = document.getElementById('emailInput');
  const errorEl    = document.getElementById('notifyError');
  const successEl  = document.getElementById('notifySuccess');
  const formEl     = document.getElementById('notifyForm');
  if (!emailInput || !errorEl || !successEl || !formEl) return;
  const email = emailInput.value.trim();
  errorEl.textContent = '';
  if (!email || !email.includes('@')) {
    errorEl.textContent = 'Please enter a valid email address.';
    return;
  }
  try {
    // Simulating success — replace with real API call when backend is ready
    const fakeSuccess = true;
    if (fakeSuccess) {
      formEl.style.display = 'none';
      successEl.style.display = 'flex';
      return;
    }
    const res  = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) {
      formEl.style.display    = 'none';
      successEl.style.display = 'flex';
    } else {
      errorEl.textContent = data.message || 'Something went wrong.';
    }
  } catch {
    errorEl.textContent = 'Network error. Please try again.';
  }
}

// ─── TYPING ───
const PHRASES = [
  'Share files. Save the planet.',
  'Encrypted. Sustainable. Trusted.',
  'Your circle. Your privacy.',
  'Green sharing for a greener future.',
];
let phraseIndex = 0, charIndex = 0, isDeleting = false;

function type() {
  const typedEl = document.getElementById('typed');
  if (!typedEl) return;
  const current = PHRASES[phraseIndex];
  charIndex += isDeleting ? -1 : 1;
  typedEl.textContent = current.substring(0, charIndex);
  let delay = isDeleting ? 50 : 90;
  if (!isDeleting && charIndex === current.length) {
    delay = 2000; isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % PHRASES.length;
    delay = 400;
  }
  setTimeout(type, delay);
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  buildCountdownUI();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  type();

  const emailInput = document.getElementById('emailInput');
  if (emailInput) {
    emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); submitNotify(); }
    });
  }
});
