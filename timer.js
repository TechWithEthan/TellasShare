function updateCountdown() {
  const now  = new Date();
  LAUNCH_DATE = getLaunchDate(); // recalculate every tick so rollover is instant

  // Optional: show the target date somewhere in your UI
  const dateEl = document.getElementById("launch-date-display");
  if (dateEl) dateEl.textContent = formatDDMMYY(LAUNCH_DATE);

  const diff = LAUNCH_DATE - now;
  // ... rest of your existing code unchanged
}