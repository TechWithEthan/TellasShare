// ================= LAUNCH DATE =================
// Always targets 12:00 AM (midnight) — start of tomorrow.
function getLaunchDate() {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // next midnight = start of tomorrow
    0, 0, 0            // 12:00 AM
  );
}

let LAUNCH_DATE = getLaunchDate();

// ================= FORMAT dd-mm-yy =================
function formatDDMMYY(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
}

// ================= DEVICE CHECK =================
// Returns true if the user is on a phone or tablet
function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

// ================= BUILD COUNTDOWN HTML =================
function buildCountdownUI() {
  const container = document.getElementById("cdUnits");
  if (!container) return;

  const units = [
    { id: "cd-days",  label: "Days"    },
    { id: "cd-hours", label: "Hours"   },
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

// ================= UPDATE COUNTDOWN =================
function updateCountdown() {
  const now = new Date();
  LAUNCH_DATE = getLaunchDate(); // recalculate every tick — live rollover at midnight

  // Optional: update a date display element — add <span id="cd-date"></span> in your HTML
  const dateEl = document.getElementById("cd-date");
  if (dateEl) dateEl.textContent = formatDDMMYY(LAUNCH_DATE);

  const diff = LAUNCH_DATE - now;

  if (diff <= 0) {
    if (!isMobileDevice()) {
      // Desktop: redirect to homepage
      window.location.href = "homepage for Computer.html";
    } else {
      // Phone/tablet: stay on page — show coming soon message
      const container = document.getElementById("cdUnits");
      if (container) {
        container.innerHTML = '<div class="cd-launched">🚀 We\'ve launched! Mobile coming soon.</div>';
      }
    }
    return;
  }

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins  = Math.floor((diff / (1000 * 60)) % 60);
  const secs  = Math.floor((diff / 1000) % 60);

  setDigit("cd-days",  pad(days));
  setDigit("cd-hours", pad(hours));
  setDigit("cd-mins",  pad(mins));
  setDigit("cd-secs",  pad(secs));
}

// ================= SET DIGIT (with flip animation) =================
function setDigit(id, newValue) {
  const el = document.getElementById(id);
  if (!el) return;

  if (el.textContent === newValue) return; // no change, skip animation

  el.classList.add("flip-out");

  setTimeout(() => {
    el.textContent = newValue;
    el.classList.remove("flip-out");
    el.classList.add("flip-in");
    setTimeout(() => el.classList.remove("flip-in"), 300);
  }, 150);
}

// ================= HELPERS =================
function pad(n) {
  return String(n).padStart(2, "0");
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  buildCountdownUI();
  updateCountdown();          // run immediately so there's no blank flash
  setInterval(updateCountdown, 1000);
});