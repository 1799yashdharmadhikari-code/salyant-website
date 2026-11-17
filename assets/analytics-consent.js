(function () {
  'use strict';
  var CONSENT_KEY = 'salyant_cookie_consent';
  var MEASUREMENT_ID = 'G-3ZF3X6JFWQ';
  var BANNER_ID = 'salyant-cookie-consent';

  function readConsent() {
    try { return window.localStorage.getItem(CONSENT_KEY); }
    catch (error) { return null; }
  }
  function writeConsent(value) {
    try { window.localStorage.setItem(CONSENT_KEY, value); }
    catch (error) { return false; }
    return true;
  }
  function safePageLocation(raw) {
    try {
      var url = new URL(raw || window.location.href);
      var allowed = new URLSearchParams();
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'msclkid'].forEach(function (key) {
        var value = url.searchParams.get(key);
        if (value) allowed.set(key, value);
      });
      return url.origin + url.pathname + (allowed.toString() ? '?' + allowed.toString() : '');
    } catch (error) {
      return window.location.origin + window.location.pathname;
    }
  }

  function loadAnalytics() {
    if (readConsent() !== 'accepted' || window.gaLoaded) return;
    window.gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, { anonymize_ip: true, send_page_view: false });
    window.gtag('event', 'page_view', { page_location: safePageLocation(), page_title: document.title });
    if (!document.querySelector('script[data-salyant-ga4="true"]')) {
      var script = document.createElement('script');
      script.async = true;
      script.dataset.salyantGa4 = 'true';
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
      document.head.appendChild(script);
    }
  }
  function makeButton(label, background, foreground) {
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.cssText = 'border:1px solid rgba(255,255,255,.28);border-radius:9px;padding:10px 16px;font:600 13px system-ui;cursor:pointer;min-width:94px;background:' + background + ';color:' + foreground + ';';
    return button;
  }
  function showConsentBanner() {
    if (readConsent() || document.getElementById(BANNER_ID) || document.getElementById('ai-cookie-bot')) return;
    var banner = document.createElement('section');
    banner.id = BANNER_ID;
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie preferences');
    banner.setAttribute('aria-live', 'polite');
    banner.style.cssText = 'position:fixed;z-index:2147483000;right:20px;bottom:20px;width:min(390px,calc(100vw - 32px));box-sizing:border-box;padding:20px;border:1px solid rgba(212,165,116,.42);border-radius:16px;background:#10131b;color:#f3f4f6;box-shadow:0 18px 48px rgba(0,0,0,.42);font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;';
    var heading = document.createElement('strong');
    heading.textContent = 'Your cookie choice';
    heading.style.cssText = 'display:block;font-size:15px;margin-bottom:7px;color:#fff;';
    var copy = document.createElement('p');
    copy.textContent = 'We use optional Google Analytics cookies to understand how visitors use this website. You can accept or decline analytics.';
    copy.style.cssText = 'margin:0 0 10px;color:#d1d5db;';
    var policy = document.createElement('a');
    policy.href = '/cookie_policy.html';
    policy.textContent = 'Read our Cookie Policy';
    policy.style.cssText = 'display:inline-block;margin-bottom:14px;color:#e8c9a3;text-decoration:underline;font-size:13px;';
    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;';
    var decline = makeButton('Decline', 'transparent', '#f3f4f6');
    var accept = makeButton('Accept', '#d4a574', '#111827');
    decline.addEventListener('click', function () {
      writeConsent('declined');
      banner.remove();
    });
    accept.addEventListener('click', function () {
      if (writeConsent('accepted')) loadAnalytics();
      banner.remove();
    });
    actions.appendChild(decline);
    actions.appendChild(accept);
    banner.appendChild(heading);
    banner.appendChild(copy);
    banner.appendChild(policy);
    banner.appendChild(actions);
    document.body.appendChild(banner);
  }
  function initialise() {
    var consent = readConsent();
    if (consent === 'accepted') loadAnalytics();
    else if (!consent) showConsentBanner();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
})();
