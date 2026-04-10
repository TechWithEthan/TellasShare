/**
* browser-policy.js
* Detects device type + browser, then enforces:
*   - Phones: block Safari, allow everything else
*   - Laptops/Desktops: allow Chrome only, block everything else
*
* Usage: <script src="browser-policy.js"></script>  (place in <head>)
*/

(function () {
 "use strict";

 /* ─────────────────────────────────────────
  * 1. DETECTION HELPERS
  * ───────────────────────────────────────── */

 const ua = navigator.userAgent;

 /** Returns true if the device is a phone (not tablet) */
 function isPhone() {
   return /iPhone|Android.*Mobile|Windows Phone|BlackBerry|IEMobile/i.test(ua);
 }

 /** Returns true if the device is a tablet */
 function isTablet() {
   return /iPad|Android(?!.*Mobile)|Tablet/i.test(ua);
 }

 /** Returns true if the device is a laptop or desktop */
 function isDesktop() {
   return !isPhone() && !isTablet();
 }

 /**
  * Detect the current browser.
  * Returns one of: "chrome" | "safari" | "firefox" | "edge" | "opera" | "samsung" | "other"
  */
 function getBrowser() {
   if (/Edg\//i.test(ua))                                        return "edge";
   if (/OPR\/|Opera/i.test(ua))                                  return "opera";
   if (/SamsungBrowser/i.test(ua))                               return "samsung";
   if (/Chrome\/|CriOS\//i.test(ua) && !/Edg|OPR/i.test(ua))   return "chrome";
   if (/Firefox\/|FxiOS\//i.test(ua))                            return "firefox";
   if (/Safari\//i.test(ua) && !/Chrome|CriOS/i.test(ua))       return "safari";
   return "other";
 }

 /* ─────────────────────────────────────────
  * 2. POLICY RULES
  *
  *   phone   → Safari BLOCKED, rest allowed
  *   tablet  → no restriction (customize as needed)
  *   desktop → only Chrome ALLOWED, rest blocked
  * ───────────────────────────────────────── */

 const POLICY = {
   phone: {
     blockedBrowsers: ["safari"],
     allowedBrowsers: null,        // null = all others allowed
   },
   tablet: {
     blockedBrowsers: [],
     allowedBrowsers: null,
   },
   desktop: {
     blockedBrowsers: null,        // null = derived from allowedBrowsers
     allowedBrowsers: ["chrome"],  // whitelist mode
   },
 };

 /* ─────────────────────────────────────────
  * 3. ENFORCEMENT LOGIC
  * ───────────────────────────────────────── */

 function getDeviceType() {
   if (isPhone())   return "phone";
   if (isTablet())  return "tablet";
   return "desktop";
 }

 /**
  * Returns true if the current browser should be BLOCKED
  * given the active policy for this device type.
  */
 function isBrowserBlocked(deviceType, browser) {
   const policy = POLICY[deviceType];
   if (!policy) return false;

   // Whitelist mode: only listed browsers are allowed
   if (policy.allowedBrowsers !== null) {
     return !policy.allowedBrowsers.includes(browser);
   }

   // Blocklist mode: listed browsers are blocked
   if (policy.blockedBrowsers !== null) {
     return policy.blockedBrowsers.includes(browser);
   }

   return false;
 }

 /* ─────────────────────────────────────────
  * 4. REDIRECT / BLOCK PAGE
  * ───────────────────────────────────────── */

 /**
  * Recommended browsers to show on the block page.
  * Customize text / download links as needed.
  */
 const RECOMMENDED = {
   phone: {
     name: "Chrome for Mobile",
     url: "https://www.google.com/chrome/",
     note: "Safari is not supported on this platform.",
   },
   desktop: {
     name: "Google Chrome",
     url: "https://www.google.com/chrome/",
     note: "Please use Google Chrome on desktop.",
   },
   tablet: {
     name: "Any modern browser",
     url: "https://www.google.com/chrome/",
     note: "For the best experience, use a supported browser.",
   },
 };

 /** Injects a full-screen block page and stops page execution */
 function showBlockPage(deviceType, browser) {
   const rec = RECOMMENDED[deviceType] || RECOMMENDED.desktop;

   // Prevent the rest of the page from rendering
   document.documentElement.innerHTML = "";

   const style = `
     *{margin:0;padding:0;box-sizing:border-box}
     body{
       font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
       background:#0f1115;
       color:#f0f4f8;
       min-height:100vh;
       display:flex;
       align-items:center;
       justify-content:center;
       padding:24px;
     }
     .card{
       background:#1a1d23;
       border:1px solid rgba(255,255,255,0.08);
       border-radius:16px;
       padding:40px 36px;
       max-width:420px;
       width:100%;
       text-align:center;
     }
     .icon{font-size:48px;margin-bottom:20px;display:block}
     h1{font-size:22px;font-weight:700;margin-bottom:10px}
     p{font-size:14px;color:#8a95a3;line-height:1.7;margin-bottom:8px}
     .badge{
       display:inline-block;
       background:rgba(255,80,80,0.12);
       color:#ff6b6b;
       border:1px solid rgba(255,80,80,0.25);
       border-radius:20px;
       font-size:12px;
       padding:4px 12px;
       margin-bottom:24px;
       font-family:monospace;
     }
     .btn{
       display:inline-block;
       margin-top:20px;
       padding:12px 28px;
       background:#00e5a0;
       color:#000;
       font-weight:700;
       font-size:14px;
       border-radius:10px;
       text-decoration:none;
       transition:opacity .2s;
     }
     .btn:hover{opacity:.85}
     .meta{
       margin-top:28px;
       font-size:11px;
       color:rgba(255,255,255,0.2);
       font-family:monospace;
     }
   `;

   const html = `
     <!DOCTYPE html>
     <html lang="en">
     <head>
       <meta charset="UTF-8"/>
       <meta name="viewport" content="width=device-width,initial-scale=1"/>
       <title>Browser not supported</title>
       <style>${style}</style>
     </head>
     <body>
       <div class="card">
         <span class="icon">🚫</span>
         <h1>Browser not supported</h1>
         <div class="badge">${browser} · ${deviceType}</div>
         <p>${rec.note}</p>
         <p>To continue, please switch to <strong style="color:#f0f4f8">${rec.name}</strong>.</p>
         <a class="btn" href="${rec.url}" target="_blank" rel="noopener">Download ${rec.name}</a>
         <div class="meta">
           detected: ${browser} on ${deviceType} &nbsp;|&nbsp; policy blocked
         </div>
       </div>
     </body>
     </html>
   `;

   document.open();
   document.write(html);
   document.close();

   // Hard-stop any further scripts on the original page
   throw new Error("[BrowserPolicy] Access blocked — " + browser + " is not allowed on " + deviceType);
 }

 /* ─────────────────────────────────────────
  * 5. LOGGING (optional — remove in prod)
  * ───────────────────────────────────────── */

 function log(msg, data) {
   if (typeof console !== "undefined") {
     console.log("[BrowserPolicy]", msg, data || "");
   }
 }

 /* ─────────────────────────────────────────
  * 6. MAIN — run on script load
  * ───────────────────────────────────────── */

 function enforce() {
   const deviceType = getDeviceType();
   const browser    = getBrowser();

   log("Device type:", deviceType);
   log("Browser detected:", browser);
   log("Policy:", POLICY[deviceType]);

   if (isBrowserBlocked(deviceType, browser)) {
     log("BLOCKED →", browser + " on " + deviceType);
     showBlockPage(deviceType, browser);
   } else {
     log("ALLOWED →", browser + " on " + deviceType);
   }
 }

 enforce();

})();
