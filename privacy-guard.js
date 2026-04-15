/**
 * Incognito / Private Mode Detector
 * Supports: Chrome, Firefox, Edge, Safari
 * Usage: call isIncognito().then(detected => { ... })
 */

(function () {

  // 1. Storage Quota Check (Chrome/Edge — incognito caps quota ~120MB)
  function checkStorageQuota() {
    return new Promise(function (resolve) {
      if (!navigator.storage || !navigator.storage.estimate) return resolve(false);
      navigator.storage.estimate().then(function (est) {
        resolve(est.quota !== undefined && est.quota < 120 * 1024 * 1024);
      }).catch(function () { resolve(false); });
    });
  }

  // 2. localStorage Write Test (blocked in some private modes)
  function checkLocalStorage() {
    return new Promise(function (resolve) {
      try {
        var key = '__priv_ls_test__';
        localStorage.setItem(key, '1');
        localStorage.removeItem(key);
        resolve(false);
      } catch (e) {
        resolve(true);
      }
    });
  }

  // 3. IndexedDB Test (fails/errors in Firefox private mode)
  function checkIndexedDB() {
    return new Promise(function (resolve) {
      if (!window.indexedDB) return resolve(true);
      try {
        var req = indexedDB.open('__priv_idb_test__', 1);
        req.onerror = function () { resolve(true); };
        req.onsuccess = function (e) {
          e.target.result.close();
          indexedDB.deleteDatabase('__priv_idb_test__');
          resolve(false);
        };
      } catch (e) {
        resolve(true);
      }
    });
  }

  // 4. WebGL Renderer Check (Firefox private uses SwiftShader/software renderer)
  function checkWebGLRenderer() {
    return new Promise(function (resolve) {
      try {
        var canvas = document.createElement('canvas');
        var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return resolve(false);
        var ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (!ext) return resolve(false);
        var renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '';
        resolve(/SwiftShader|llvmpipe|softpipe/i.test(renderer));
      } catch (e) {
        resolve(false);
      }
    });
  }

  // 5. FileSystem API (Chrome legacy — fails in incognito)
  function checkFileSystemAPI() {
    return new Promise(function (resolve) {
      var fs = window.RequestFileSystem || window.webkitRequestFileSystem;
      if (!fs) return resolve(false);
      fs(window.TEMPORARY, 100,
        function () { resolve(false); },  // success = normal
        function () { resolve(true); }    // error   = incognito
      );
    });
  }

  // 6. SessionStorage Test (extra safety net)
  function checkSessionStorage() {
    return new Promise(function (resolve) {
      try {
        var key = '__priv_ss_test__';
        sessionStorage.setItem(key, '1');
        sessionStorage.removeItem(key);
        resolve(false);
      } catch (e) {
        resolve(true);
      }
    });
  }

  // 7. CacheStorage Test (blocked in some private modes)
  function checkCacheStorage() {
    return new Promise(function (resolve) {
      if (!window.caches) return resolve(false);
      caches.open('__priv_cache_test__')
        .then(function () {
          caches.delete('__priv_cache_test__');
          resolve(false);
        })
        .catch(function () { resolve(true); });
    });
  }

  // --- Master Detection Function ---
  function isIncognito() {
    return Promise.all([
      checkStorageQuota(),
      checkLocalStorage(),
      checkIndexedDB(),
      checkWebGLRenderer(),
      checkFileSystemAPI(),
      checkSessionStorage(),
      checkCacheStorage()
    ]).then(function (results) {
      // Returns true if ANY signal detects private mode
      return results.some(function (r) { return r === true; });
    });
  }

  // --- Block Handler: customize this section ---
  function blockUser() {
    // OPTION 1: Show a full-page overlay
    var overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'background:rgba(0,0,0,0.95)',
      'color:#fff',
      'display:flex',
      'flex-direction:column',
      'align-items:center',
      'justify-content:center',
      'text-align:center',
      'z-index:2147483647',
      'font-family:system-ui,sans-serif',
      'padding:2rem'
    ].join(';');

    overlay.innerHTML = [
      '<h2 style="font-size:22px;margin-bottom:12px;">Private Browsing Not Allowed</h2>',
      '<p style="color:#ccc;max-width:420px;line-height:1.6;">',
      'This site does not support Incognito or Private browsing mode.<br>',
      'Please reopen this page in a normal browser window to continue.',
      '</p>'
    ].join('');

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden'; // prevent scrolling underneath

    // OPTION 2: Redirect instead (uncomment to use)
    // window.location.replace('/blocked.html');

    // OPTION 3: Log to your analytics/backend (uncomment to use)
    // fetch('/api/log-incognito', { method: 'POST' });
  }

  // --- Run on DOM ready ---
  function init() {
    isIncognito().then(function (detected) {
      if (detected) {
        blockUser();
        console.warn('[Privacy Guard] Private browsing mode detected. Access blocked.');
      } else {
        console.log('[Privacy Guard] Normal browsing. Access granted.');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();