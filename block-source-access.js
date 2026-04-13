(function () {
  const BLOCKED_EXTENSIONS = [
    ".css", ".js", ".html", ".htm", ".json", ".xml", ".txt",
    ".map", ".ts", ".jsx", ".tsx", ".scss", ".sass", ".less",
    ".env", ".config"
  ];

  const ALLOWED_PATHS = ["/", "/index.html"];

  const path = window.location.pathname.toLowerCase();

  const isBlocked = BLOCKED_EXTENSIONS.some(ext => path.endsWith(ext));
  const isAllowed = ALLOWED_PATHS.includes(path);

  if (isBlocked && !isAllowed) {
    window.location.replace("/");
  }

  // Extra: block right-click + dev shortcuts (basic)
  document.addEventListener("contextmenu", e => e.preventDefault());

  document.addEventListener("keydown", function (e) {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
      (e.ctrlKey && e.key === "U")
    ) {
      e.preventDefault();
    }
  });
})();