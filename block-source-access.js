(function () {
  const BLOCKED_EXTENSIONS = [
    ".css", ".js", ".html", ".htm", ".json", ".xml", ".txt",
    ".map", ".ts", ".jsx", ".tsx", ".scss", ".sass", ".less",
    ".env", ".config",
  ];

  const ALLOWED_PATHS = ["/", "/index.html"];

  const currentPath = window.location.pathname.toLowerCase();

  const isBlocked = BLOCKED_EXTENSIONS.some((ext) => currentPath.endsWith(ext));
  const isAllowed = ALLOWED_PATHS.includes(currentPath);

  if (isBlocked && !isAllowed) {
    window.location.replace("/");
  }
})();