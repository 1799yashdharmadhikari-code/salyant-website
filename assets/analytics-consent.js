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
  function clearAnalyticsCookies() {
    try {
      var names = ['_ga', '_gid'];
      String(document.cookie || '').split(';').forEach(function (part) {
        var name = part.split('=')[0].trim();
        if (/^_ga(?:_|$)|^_gid$/i.test(name) && names.indexOf(name) < 0) names.push(name);
      });
      var domains = [null, window.location.hostname, '.' + window.location.hostname, '.salyant.co.uk'];
      names.forEach(function (name) {
        domains.forEach(function (domain) {
          var cookie = name + '=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
          if (domain) cookie += '; domain=' + domain;
          document.cookie = cookie;
        });
      });
    } catch (error) {}
  }

  function setAnalyticsConsent(value) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: value === 'accepted' ? 'granted' : 'denied' });
    }
    if (value !== 'accepted') clearAnalyticsCookies();
  }

  window.salyantUpdateAnalyticsConsent = setAnalyticsConsent;
  window.salyantClearAnalyticsCookies = clearAnalyticsCookies;

  function safePageLocation(raw) {
    try {
      var url = new window.URL(raw || window.location.href);
      var allowed = new window.URLSearchParams();
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
    if (readConsent() !== 'accepted') return;
    if (window.gaLoaded) { setAnalyticsConsent('accepted'); return; }
    window.gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, { anonymize_ip: true, send_page_view: false });
    var pageView = { page_location: safePageLocation(), page_title: document.title };
    if (document.referrer) pageView.page_referrer = safePageLocation(document.referrer);
    window.gtag('event', 'page_view', pageView);
    if (!document.querySelector('script[data-salyant-ga4="true"]')) {
      var script = document.createElement('script');
      script.async = true;
      script.dataset.salyantGa4 = 'true';
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
      document.head.appendChild(script);
    }
  }
  window.salyantLoadAnalytics = loadAnalytics;
  function makeButton(label, background, foreground) {
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.cssText = 'border:1px solid rgba(255,255,255,.28);border-radius:9px;padding:10px 16px;font:600 13px system-ui;cursor:pointer;min-width:94px;background:' + background + ';color:' + foreground + ';';
    return button;
  }
  function showConsentBanner(force) {
    var homepageBanner = document.getElementById('ai-cookie-bot');
    if (homepageBanner) {
      if (force) { homepageBanner.style.transform = 'translateY(0)'; homepageBanner.style.visibility = 'visible'; }
      return;
    }
    if ((!force && readConsent()) || document.getElementById(BANNER_ID)) return;
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
      setAnalyticsConsent('declined');
      banner.remove();
    });
    accept.addEventListener('click', function () {
      if (writeConsent('accepted')) { setAnalyticsConsent('accepted'); loadAnalytics(); }
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
  function addSettingsControl() {
    var footer = document.querySelector('footer');
    if (!footer || document.getElementById('salyant-cookie-settings')) return;
    var button = document.createElement('button');
    button.id = 'salyant-cookie-settings';
    button.type = 'button';
    button.textContent = 'Cookie settings';
    button.setAttribute('aria-label', 'Change cookie preferences');
    button.style.cssText = 'margin-top:12px;padding:6px 10px;border:1px solid rgba(212,165,116,.45);border-radius:8px;background:transparent;color:#e8c9a3;font:13px system-ui;cursor:pointer;';
    button.addEventListener('click', function () { showConsentBanner(true); });
    footer.appendChild(button);
  }

  function initialise() {
    addSettingsControl();
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
