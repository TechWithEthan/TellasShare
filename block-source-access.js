/**
 * block-source-access.js
 * Blocks direct URL access to source files (.html, .css, .js, etc.)
 * Place this script in your main entry point (e.g. index.html)
 * OR use the _redirects / netlify.toml approach (recommended, see below).
 *
 * Usage: <script src="block-source-access.js"></script> in your index.html
 */

(function () {
  // File extensions to block
  const BLOCKED_EXTENSIONS = [
    ".css",
    ".js",
    ".html",
    ".htm",
    ".json",
    ".xml",
    ".txt",
    ".map",
    ".ts",
    ".jsx",
    ".tsx",
    ".scss",
    ".sass",
    ".less",
    ".env",
    ".config",
  ];

  // Pages that ARE allowed (your actual app pages)
  const ALLOWED_PATHS = [
    "/",
    "/index.html",   // Allow only the root entry point
  ];

  const currentPath = window.location.pathname.toLowerCase();

  // Check if the current URL ends with a blocked extension
  const isBlocked = BLOCKED_EXTENSIONS.some((ext) =>
    currentPath.endsWith(ext)
  );

  // Check if the path is explicitly allowed
  const isAllowed = ALLOWED_PATHS.includes(currentPath);

  if (isBlocked && !isAllowed) {
    // Option 1: Redirect to homepage (friendlier)
    window.location.replace("/");

    // Option 2: Show a 403-style block page (uncomment to use instead)
    /*
    document.open();
    document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <title>403 Forbidden</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 80px; background: #f5f5f5; }
          h1 { font-size: 48px; color: #cc0000; }
          p  { font-size: 18px; color: #555; }
          a  { color: #0077cc; }
        </style>
      </head>
      <body>
        <h1>403</h1>
        <p>Access to this resource is forbidden.</p>
        <p><a href="/">Go back home</a></p>
      </body>
      </html>
    `);
    document.close();
    */
  }
})();