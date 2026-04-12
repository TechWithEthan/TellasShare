// ================= CONFIG =================
const DEFAULT = {
  month: 4,   // September (0-based: 0=Jan, 8=Sep)
  day:   1,  // 1st
  hour:  0,  // midnight
  min:   0,
  sec:   10,
};

// ================= LAUNCH DATE =================
function getLaunchDate() {
  const saved = localStorage.getItem("launchDate");
  if (saved) return new Date(saved);

  const now = new Date();
  return new Date(
    now.getFullYear(),
    DEFAULT.month,
    DEFAULT.day,
    DEFAULT.hour,
    DEFAULT.min,
    DEFAULT.sec
  );
}

let LAUNCH_DATE = getLaunchDate();

// ================= BUILD COUNTDOWN HTML =================
// Runs once on load — creates the 4 flip boxes inside #cdUnits
function buildCountdownUI() {
  const container = document.getElementById("cdUnits");
  if (!container) return;

  const units = [
    { id: "cd-days",  label: "Days"    },
    { id: "cd-hours", label: "Hours"   },
    { id: "cd-mins",  label: "Minutes" },
    { id: "cd-secs",  label: "Seconds" },
  ];

  container.innerHTML = ""; // clear any placeholder content

  units.forEach((u, i) => {
    // Separator colon between units (not after last)
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
  const now  = new Date();
  const diff = LAUNCH_DATE - now;

  if (diff <= 0) {
    const container = document.getElementById("cdUnits");
    if (container) {
      container.innerHTML = '<div class="cd-launched">🚀 We\'ve launched!</div>';
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

    // Clean up flip-in after it plays
    setTimeout(() => el.classList.remove("flip-in"), 300);
  }, 150);
}

// ================= HELPERS =================
function pad(n) {
  return String(n).padStart(2, "0");
}

// Optional: exposed helpers for console/admin use
function setLaunch(dateValue) {
  if (!dateValue) return;
  localStorage.setItem("launchDate", dateValue);
  LAUNCH_DATE = new Date(dateValue);
}

function resetLaunch() {
  localStorage.removeItem("launchDate");
  LAUNCH_DATE = getLaunchDate();
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  buildCountdownUI();
  updateCountdown();          // run immediately so there's no blank flash
  setInterval(updateCountdown, 1000);
});