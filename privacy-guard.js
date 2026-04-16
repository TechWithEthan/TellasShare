/**
 * PrivacyGuard — Incognito / Private Mode Detector
 * ─────────────────────────────────────────────────
 * Blocks: Chrome Incognito, Firefox Private, Safari Private (macOS + iOS),
 *         Edge InPrivate, Android Chrome Incognito, Samsung Internet Private
 * Allows: All normal browsing on all devices & browsers
 *
 * Drop-in usage (auto-blocking):
 *   <script src="incognito-detector.js"></script>
 *
 * Manual usage:
 *   PrivacyGuard.isIncognito().then(result => {
 *     console.log(result.detected, result.score, result.signals);
 *   });
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PrivacyGuard = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     SIGNAL CHECKS
     Each returns Promise<{ signal, detected, reason? }>
  ═══════════════════════════════════════════════════════════ */

  // ── 1. localStorage ───────────────────────────────────────
  // iOS Safari Private throws SecurityError on write.
  // Some aggressive Android private browsers do too.
  function checkLocalStorage() {
    return new Promise(function (resolve) {
      try {
        var k = '__pg_ls_' + Date.now() + '__';
        localStorage.setItem(k, '1');
        localStorage.removeItem(k);
        resolve({ signal: 'localStorage', detected: false });
      } catch (e) {
        resolve({ signal: 'localStorage', detected: true, reason: e.name });
      }
    });
  }

  // ── 2. sessionStorage ─────────────────────────────────────
  // Blocked on some aggressive private modes.
  function checkSessionStorage() {
    return new Promise(function (resolve) {
      try {
        var k = '__pg_ss_' + Date.now() + '__';
        sessionStorage.setItem(k, '1');
        sessionStorage.removeItem(k);
        resolve({ signal: 'sessionStorage', detected: false });
      } catch (e) {
        resolve({ signal: 'sessionStorage', detected: true, reason: e.name });
      }
    });
  }

  // ── 3. IndexedDB ──────────────────────────────────────────
  // Firefox Private: IDB open request errors immediately.
  // iOS Safari Private (older): IDB unavailable entirely.
  function checkIndexedDB() {
    return new Promise(function (resolve) {
      if (!window.indexedDB) {
        return resolve({ signal: 'indexedDB', detected: true, reason: 'unavailable' });
      }
      try {
        var name = '__pg_idb_' + Math.random().toString(36).slice(2) + '__';
        var req = indexedDB.open(name, 1);
        var timer = setTimeout(function () {
          resolve({ signal: 'indexedDB', detected: true, reason: 'timeout' });
        }, 1500);
        req.onerror = function () {
          clearTimeout(timer);
          resolve({ signal: 'indexedDB', detected: true, reason: 'error' });
        };
        req.onblocked = function () {
          clearTimeout(timer);
          resolve({ signal: 'indexedDB', detected: true, reason: 'blocked' });
        };
        req.onsuccess = function (e) {
          clearTimeout(timer);
          try { e.target.result.close(); } catch (_) {}
          try { indexedDB.deleteDatabase(name); } catch (_) {}
          resolve({ signal: 'indexedDB', detected: false });
        };
      } catch (e) {
        resolve({ signal: 'indexedDB', detected: true, reason: e.name });
      }
    });
  }

  // ── 4. Storage Quota ──────────────────────────────────────
  // Chrome / Edge Incognito: quota is RAM-based (~1–4 GB).
  // Normal Chrome: quota is disk-based (20 GB+).
  // iOS Safari Private: quota is near 0 (< 1 MB).
  function checkStorageQuota() {
    return new Promise(function (resolve) {
      if (!navigator.storage || !navigator.storage.estimate) {
        return resolve({ signal: 'storageQuota', detected: false });
      }
      navigator.storage.estimate().then(function (est) {
        if (est.quota === undefined) {
          return resolve({ signal: 'storageQuota', detected: false });
        }
        // < 2 GB → Chrome/Edge incognito (RAM cap)
        // < 1 MB → iOS Safari private (near-zero quota)
        var detected = est.quota < 2 * 1024 * 1024 * 1024;
        resolve({ signal: 'storageQuota', detected: detected, quota: est.quota });
      }).catch(function (e) {
        resolve({ signal: 'storageQuota', detected: true, reason: 'estimate_failed' });
      });
    });
  }

  // ── 5. CacheStorage ───────────────────────────────────────
  // Blocked / throws on Firefox Private, older iOS Safari Private.
  function checkCacheStorage() {
    return new Promise(function (resolve) {
      if (!window.caches) return resolve({ signal: 'cacheStorage', detected: false });
      var name = '__pg_cache_' + Math.random().toString(36).slice(2) + '__';
      caches.open(name)
        .then(function () {
          caches.delete(name);
          resolve({ signal: 'cacheStorage', detected: false });
        })
        .catch(function (e) {
          resolve({ signal: 'cacheStorage', detected: true, reason: e.name });
        });
    });
  }

  // ── 6. Cookies ────────────────────────────────────────────
  // navigator.cookieEnabled = false in some private modes.
  // Cookie write test catches edge cases.
  function checkCookies() {
    return new Promise(function (resolve) {
      if (navigator.cookieEnabled === false) {
        return resolve({ signal: 'cookies', detected: true, reason: 'cookieEnabled_false' });
      }
      try {
        var k = '__pg_ck__';
        document.cookie = k + '=1; SameSite=Strict; path=/';
        var ok = document.cookie.indexOf(k) !== -1;
        document.cookie = k + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; path=/';
        resolve({ signal: 'cookies', detected: !ok });
      } catch (e) {
        resolve({ signal: 'cookies', detected: true, reason: e.name });
      }
    });
  }

  // ── 7. Safari Private (macOS + iOS) ───────────────────────
  // Most reliable check for Apple devices:
  //   a) window.openDatabase (WebSQL) throws in Safari Private
  //   b) Storage quota near 0 (< 1 MB) on iOS Private
  function checkSafariPrivate() {
    return new Promise(function (resolve) {
      var ua = navigator.userAgent || '';
      var isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
      var isIOS = /iPad|iPhone|iPod/.test(ua) ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      if (!isSafari && !isIOS) {
        return resolve({ signal: 'safariPrivate', detected: false });
      }

      // Method A — WebSQL (still present in Safari, removed elsewhere)
      if (typeof window.openDatabase !== 'undefined') {
        try {
          window.openDatabase(null, null, null, null);
        } catch (e) {
          return resolve({ signal: 'safariPrivate', detected: true, reason: 'openDatabase:' + e.name });
        }
      }

      // Method B — Quota near 0 on iOS Private
      if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then(function (est) {
          var isPrivate = est.quota !== undefined && est.quota < 1024 * 1024; // < 1 MB
          resolve({ signal: 'safariPrivate', detected: isPrivate, quota: est.quota });
        }).catch(function () {
          resolve({ signal: 'safariPrivate', detected: true, reason: 'estimate_failed' });
        });
      } else {
        resolve({ signal: 'safariPrivate', detected: isIOS });
      }
    });
  }

  // ── 8. Performance Memory ─────────────────────────────────
  // Chrome / Edge only — incognito caps jsHeapSizeLimit (soft signal).
  function checkPerfMemory() {
    return new Promise(function (resolve) {
      try {
        var mem = performance && performance.memory;
        if (!mem || !mem.jsHeapSizeLimit) {
          return resolve({ signal: 'perfMemory', detected: false });
        }
        // Incognito typically ≤ 2 GB heap; normal can be 4 GB+
        resolve({ signal: 'perfMemory', detected: mem.jsHeapSizeLimit <= 2 * 1024 * 1024 * 1024 });
      } catch (e) {
        resolve({ signal: 'perfMemory', detected: false });
      }
    });
  }

  // ── 9. WebGL Software Renderer ────────────────────────────
  // Firefox Private may use SwiftShader / llvmpipe (soft signal).
  function checkWebGL() {
    return new Promise(function (resolve) {
      try {
        var canvas = document.createElement('canvas');
        var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return resolve({ signal: 'webGL', detected: false });
        var ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (!ext) return resolve({ signal: 'webGL', detected: false });
        var renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '';
        resolve({ signal: 'webGL', detected: /SwiftShader|llvmpipe|softpipe|mesa offscreen/i.test(renderer) });
      } catch (e) {
        resolve({ signal: 'webGL', detected: false });
      }
    });
  }

  // ── 10. Service Worker Restriction ────────────────────────
  // Some private modes block SW listing / registration.
  function checkServiceWorker() {
    return new Promise(function (resolve) {
      if (!navigator.serviceWorker) return resolve({ signal: 'serviceWorker', detected: false });
      navigator.serviceWorker.getRegistrations()
        .then(function () { resolve({ signal: 'serviceWorker', detected: false }); })
        .catch(function (e) { resolve({ signal: 'serviceWorker', detected: true, reason: e.name }); });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     WEIGHTED SCORING ENGINE
     Score >= THRESHOLD → private mode confirmed
  ═══════════════════════════════════════════════════════════ */

  var WEIGHTS = {
    localStorage:   10,  // Safari Private iOS/macOS — near-definitive
    safariPrivate:  10,  // Safari-specific WebSQL / quota — near-definitive
    indexedDB:       9,  // Firefox Private — very reliable
    cookies:         8,  // Cross-browser cookie block
    storageQuota:    7,  // Chrome/Edge incognito RAM cap
    cacheStorage:    6,  // Firefox / older Safari private
    sessionStorage:  5,  // Supplementary
    perfMemory:      5,  // Chrome soft signal
    webGL:           4,  // Firefox renderer swap
    serviceWorker:   4   // Supplementary
  };

  var THRESHOLD = 9; // Tune higher (e.g. 12) to reduce false positives

  function isIncognito() {
    return Promise.all([
      checkLocalStorage(),
      checkSessionStorage(),
      checkIndexedDB(),
      checkStorageQuota(),
      checkCacheStorage(),
      checkCookies(),
      checkSafariPrivate(),
      checkPerfMemory(),
      checkWebGL(),
      checkServiceWorker()
    ]).then(function (results) {
      var score = 0;
      var triggered = [];

      results.forEach(function (r) {
        if (r && r.detected) {
          score += (WEIGHTS[r.signal] || 0);
          triggered.push(r.signal + (r.reason ? ':' + r.reason : ''));
        }
      });

      return {
        detected: score >= THRESHOLD,
        score: score,
        threshold: THRESHOLD,
        signals: triggered,
        raw: results
      };
    });
  }

  /* ═══════════════════════════════════════════════════════════
     BLOCK UI
     Responsive overlay with device-specific instructions
  ═══════════════════════════════════════════════════════════ */

  function blockUser(result) {
    if (document.getElementById('__pg_overlay__')) return;

    var style = document.createElement('style');
    style.textContent = [
      '#__pg_overlay__{',
      '  position:fixed;inset:0;z-index:2147483647;',
      '  background:#09090f;',
      '  display:flex;flex-direction:column;',
      '  align-items:center;justify-content:center;',
      '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,sans-serif;',
      '  padding:20px;box-sizing:border-box;',
      '  -webkit-tap-highlight-color:transparent;',
      '}',
      '#__pg_overlay__ .pg-card{',
      '  background:#111118;',
      '  border:1px solid rgba(255,255,255,0.08);',
      '  border-radius:20px;',
      '  padding:36px 28px 28px;',
      '  max-width:400px;width:100%;',
      '  text-align:center;',
      '  box-shadow:0 0 0 1px rgba(255,255,255,0.03),0 24px 60px rgba(0,0,0,0.7);',
      '}',
      '#__pg_overlay__ .pg-icon-wrap{',
      '  width:60px;height:60px;',
      '  background:rgba(239,68,68,0.1);',
      '  border-radius:50%;',
      '  display:flex;align-items:center;justify-content:center;',
      '  margin:0 auto 20px;',
      '}',
      '#__pg_overlay__ h2{',
      '  color:#f3f3f6;font-size:18px;font-weight:600;',
      '  margin:0 0 10px;letter-spacing:-0.3px;line-height:1.3;',
      '}',
      '#__pg_overlay__ .pg-sub{',
      '  color:#6b7280;font-size:14px;line-height:1.7;',
      '  margin:0 0 22px;',
      '}',
      '#__pg_overlay__ .pg-steps{',
      '  background:#0c0c12;',
      '  border:1px solid rgba(255,255,255,0.06);',
      '  border-radius:12px;',
      '  padding:14px 18px;text-align:left;',
      '  margin-bottom:20px;',
      '}',
      '#__pg_overlay__ .pg-steps-label{',
      '  color:#4b5563;font-size:11px;font-weight:600;',
      '  text-transform:uppercase;letter-spacing:0.8px;',
      '  margin:0 0 10px;',
      '}',
      '#__pg_overlay__ .pg-steps ol{',
      '  margin:0;padding:0 0 0 16px;',
      '}',
      '#__pg_overlay__ .pg-steps li{',
      '  color:#9ca3af;font-size:13px;',
      '  line-height:1.65;margin-bottom:5px;',
      '}',
      '#__pg_overlay__ .pg-steps li:last-child{margin-bottom:0;}',
      '#__pg_overlay__ .pg-btn{',
      '  display:block;width:100%;',
      '  padding:13px 16px;',
      '  background:#3b82f6;color:#fff;',
      '  font-size:14px;font-weight:500;',
      '  border:none;border-radius:10px;',
      '  cursor:pointer;letter-spacing:-0.1px;',
      '  -webkit-appearance:none;',
      '  transition:background 0.15s,transform 0.1s;',
      '}',
      '#__pg_overlay__ .pg-btn:hover{background:#2563eb;}',
      '#__pg_overlay__ .pg-btn:active{background:#1d4ed8;transform:scale(0.98);}',
      '@media(max-width:380px){',
      '  #__pg_overlay__ .pg-card{padding:28px 20px 20px;}',
      '  #__pg_overlay__ h2{font-size:17px;}',
      '}'
    ].join('');
    document.head.appendChild(style);

    var ua = navigator.userAgent || '';
    var isIOS = /iPad|iPhone|iPod/.test(ua) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var isAndroid = /android/i.test(ua);
    var isMac = !isIOS && /Macintosh/.test(ua);

    var steps;
    if (isIOS) {
      steps = [
        'Tap the <strong style="color:#e5e7eb">Tabs</strong> icon in Safari',
        'Tap <strong style="color:#e5e7eb">Private</strong> to turn it off',
        'Close this tab, then revisit the page'
      ];
    } else if (isAndroid) {
      steps = [
        'Tap the tab switcher icon',
        'Close this Incognito tab',
        'Open a regular tab and revisit the page'
      ];
    } else if (isMac) {
      steps = [
        'Close this Private / Incognito window',
        'Open a new regular browser window (<kbd style="background:#1e1e28;padding:1px 5px;border-radius:4px;font-size:12px">⌘ N</kbd>)',
        'Revisit this page'
      ];
    } else {
      steps = [
        'Close this Private / Incognito window',
        'Open a new regular browser window',
        'Revisit this page'
      ];
    }

    var stepsHTML = steps.map(function (s) { return '<li>' + s + '</li>'; }).join('');

    var overlay = document.createElement('div');
    overlay.id = '__pg_overlay__';
    overlay.innerHTML = [
      '<div class="pg-card">',
      '  <div class="pg-icon-wrap">',
      '    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"',
      '         fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '      <circle cx="12" cy="12" r="10"/>',
      '      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>',
      '    </svg>',
      '  </div>',
      '  <h2>Private Browsing Not Allowed</h2>',
      '  <p class="pg-sub">',
      '    This site requires a normal browser session.<br>',
      '    Incognito &amp; Private windows are not supported.',
      '  </p>',
      '  <div class="pg-steps">',
      '    <p class="pg-steps-label">How to continue</p>',
      '    <ol>' + stepsHTML + '</ol>',
      '  </div>',
      '  <button class="pg-btn" onclick="window.location.reload()">',
      '    I\'ve Switched — Reload',
      '  </button>',
      '</div>'
    ].join('');

    var target = document.body || document.documentElement;
    target.appendChild(overlay);
    if (document.body) document.body.style.overflow = 'hidden';
  }

  /* ═══════════════════════════════════════════════════════════
     AUTO-INIT
  ═══════════════════════════════════════════════════════════ */

  function init() {
    isIncognito().then(function (result) {
      if (result.detected) {
        blockUser(result);
        if (window.console && console.warn) {
          console.warn('[PrivacyGuard] Private mode detected.', result);
        }
      } else {
        if (window.console && console.log) {
          console.log('[PrivacyGuard] Normal browsing. Score:', result.score, '/ Threshold:', result.threshold);
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ═══════════════════════════════════════════════════════════
     PUBLIC API
  ═══════════════════════════════════════════════════════════ */
  return {
    isIncognito: isIncognito,
    blockUser: blockUser
  };

}));