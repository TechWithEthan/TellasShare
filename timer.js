// ================= SETTINGS =================

// Pages
const COMPUTER_PAGE = "homepage for Computer.html";
const MOBILE_PAGE = "mobile.html"; // change if needed

// Delay before redirect (in ms)
const REDIRECT_DELAY = 1000;


// ================= DEVICE CHECK =================
function isMobile() {
  return /Android|iPhone|iPad/i.test(navigator.userAgent);
}


// ================= GO LIVE =================
function goLive() {
  console.log("🚀 Website is LIVE");

  if (isMobile()) {
    console.log("📱 Mobile detected");
    window.location.href = MOBILE_PAGE;
  } else {
    console.log("💻 Computer detected");
    window.location.href = COMPUTER_PAGE;
  }
}


// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

  console.log("⚡ Script Loaded");

  // Optional loading text
  document.body.innerHTML = `
    <h1 style="text-align:center; margin-top:40vh; font-family:sans-serif;">
      🚀 Launching...
    </h1>
  `;

  // Delay then redirect
  setTimeout(() => {
    goLive();
  }, REDIRECT_DELAY);

});
