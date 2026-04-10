(function () {
  "use strict";

  const ua = navigator.userAgent;

  function isPhone() {
    return /iPhone|Android.*Mobile|Windows Phone|BlackBerry|IEMobile/i.test(ua);
  }

  function isTablet() {
    return /iPad|Android(?!.*Mobile)|Tablet/i.test(ua);
  }

  function getBrowser() {
    if (/Edg\//i.test(ua)) return "edge";
    if (/OPR\/|Opera/i.test(ua)) return "opera";
    if (/SamsungBrowser/i.test(ua)) return "samsung";
    if (/Chrome\/|CriOS\//i.test(ua) && !/Edg|OPR/i.test(ua)) return "chrome";
    if (/Firefox\/|FxiOS\//i.test(ua)) return "firefox";
    if (/Safari\//i.test(ua) && !/Chrome|CriOS/i.test(ua)) return "safari";
    return "other";
  }

  const POLICY = {
    phone:   { blockedBrowsers: ["safari"], allowedBrowsers: null },
    tablet:  { blockedBrowsers: [],         allowedBrowsers: null },
    desktop: { blockedBrowsers: null,       allowedBrowsers: ["chrome"] },
  };

  function getDeviceType() {
    if (isPhone()) return "phone";
    if (isTablet()) return "tablet";
    return "desktop";
  }

  function isBrowserBlocked(deviceType, browser) {
    const policy = POLICY[deviceType];
    if (!policy) return false;
    if (policy.allowedBrowsers !== null) return !policy.allowedBrowsers.includes(browser);
    if (policy.blockedBrowsers !== null) return policy.blockedBrowsers.includes(browser);
    return false;
  }

  (function enforce() {
    const deviceType = getDeviceType();
    const browser = getBrowser();
    if (isBrowserBlocked(deviceType, browser)) {
      throw new Error("[BrowserPolicy] Access blocked — " + browser + " is not allowed on " + deviceType);
    }
  })();

})();