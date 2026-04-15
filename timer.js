// ================= LIVE MODE =================

// Set this to true to make site live instantly
const LIVE_MODE = true;

// Your main page (change if needed)
const HOME_PAGE = ""; 
// OR use full link:
// const HOME_PAGE = "https://your-site.netlify.app";


// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

  // If LIVE → go immediately
  if (LIVE_MODE) {
    goLive();
    return;
  }

  // (Optional fallback if you ever disable LIVE_MODE)
  startCountdown();

});


// ================= GO LIVE =================
function goLive() {
  console.log("🚀 Website is LIVE");

  // instant redirect
  window.location.href = HOME_PAGE;
}


// ================= OPTIONAL COUNTDOWN =================
// (Only runs if LIVE_MODE = false)

function getLaunchDate() {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0
  );
}

let LAUNCH_DATE = getLaunchDate();

function startCountdown() {
  const interval = setInterval(() => {
    const now = new Date();
    const diff = LAUNCH_DATE - now;

    if (diff <= 0) {
      clearInterval(interval);
      goLive();
    }
  }, 1000);
}
