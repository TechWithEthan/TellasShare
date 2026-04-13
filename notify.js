// notify.js

function submitNotify() {
  const emailInput = document.getElementById("emailInput");
  const successBox = document.getElementById("notifySuccess");
  const errorBox = document.getElementById("notifyError");

  const email = emailInput.value.trim();

  // Reset UI
  errorBox.style.display = "none";
  successBox.style.display = "none";
  errorBox.textContent = "";

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    showError("Please enter your email.");
    return;
  }

  if (!emailRegex.test(email)) {
    showError("Enter a valid email address.");
    return;
  }

  // Simulate saving (you can replace this with real backend API)
  try {
    let emails = JSON.parse(localStorage.getItem("notifyEmails")) || [];

    // Prevent duplicates
    if (emails.includes(email)) {
      showError("You're already on the list!");
      return;
    }

    emails.push(email);
    localStorage.setItem("notifyEmails", JSON.stringify(emails));

    // Show success
    successBox.style.display = "flex";
    emailInput.value = "";

  } catch (err) {
    showError("Something went wrong. Try again.");
  }
}

function showError(message) {
  const errorBox = document.getElementById("notifyError");
  errorBox.textContent = message;
  errorBox.style.display = "block";
}