// Cookie consent + Google Consent Mode v2 glue.
//
// The gtag snippet in <head> defaults all consent buckets to "denied"
// and reads localStorage to flip analytics_storage to "granted" before
// the GA4 config call fires. This file handles the *banner UI* — first-
// time visitors see it; their choice is persisted; subsequent loads skip
// the banner because the gtag snippet already read the same key.
//
// Storage key: "balancebookCookieConsent"
//   "granted"  → user accepted analytics; gtag('consent', 'update', ...)
//   "denied"   → user picked essentials only; no further update needed
//   missing    → never asked; show banner

(function () {
  'use strict';
  var STORAGE_KEY = 'balancebookCookieConsent';

  function readConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
  }

  function writeConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (_) {}
  }

  function grantAnalytics() {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { 'analytics_storage': 'granted' });
    }
  }

  function init() {
    var banner = document.getElementById('cookieBanner');
    if (!banner) return;

    // Show the banner if no decision has been recorded yet.
    if (readConsent() === null) {
      banner.hidden = false;
    }

    banner.addEventListener('click', function (event) {
      var action = event.target.getAttribute('data-cookie-action');
      if (!action) return;
      if (action === 'accept') {
        writeConsent('granted');
        grantAnalytics();
      } else if (action === 'essential') {
        writeConsent('denied');
      }
      banner.hidden = true;
    });

    // Footer "Cookie preferences" link re-opens the banner so users can
    // change their mind. Reverts the storage flag to null and lets gtag
    // re-read on next navigation; we also dial analytics back to denied
    // for the current page session so we're not still ingesting events
    // until reload.
    var openers = document.querySelectorAll('[data-cookie-open]');
    for (var i = 0; i < openers.length; i++) {
      openers[i].addEventListener('click', function (event) {
        event.preventDefault();
        try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
        if (typeof window.gtag === 'function') {
          window.gtag('consent', 'update', { 'analytics_storage': 'denied' });
        }
        banner.hidden = false;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
