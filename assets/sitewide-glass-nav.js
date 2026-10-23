(function () {
  'use strict';
  function isCallToAction(element) {
    var className = typeof element.className === 'string' ? element.className : '';
    return className.split(' ').some(function (token) {
      return token.indexOf('bg-') === 0 || token === 'btn' ||
        token.indexOf('btn-') === 0 || token === 'text-black';
    });
  }
  function addReadableLabel(element) {
    if (!element || element.dataset.sitewideGlassProcessed === 'true') return;
    element.dataset.sitewideGlassProcessed = 'true';
    if (isCallToAction(element) || element.querySelector('img')) return;
    element.classList.add('sitewide-glass-link');
    Array.prototype.slice.call(element.childNodes).forEach(function (node) {
      if (node.nodeType !== 3 || !node.nodeValue.trim()) return;
      var label = document.createElement('span');
      label.className = 'sitewide-glass-label';
      label.textContent = node.nodeValue.trim();
      element.replaceChild(label, node);
    });
  }
  function initialise() {
    var nav = document.querySelector('nav#navbar, nav.fixed.top-0');
    if (!nav) return;
    nav.classList.add('sitewide-glass-nav');
    function updateGlassState() {
      nav.classList.toggle('sitewide-glass-scrolled', window.scrollY > 24);
    }
    updateGlassState();
    window.addEventListener('scroll', updateGlassState, { passive: true });
    var parentCounts = new Map();
    Array.prototype.slice.call(nav.querySelectorAll('a, button')).forEach(function (element) {
      if (!isCallToAction(element) && !element.querySelector('img') &&
          (element.textContent || '').trim() && element.parentElement) {
        var parent = element.parentElement;
        parentCounts.set(parent, (parentCounts.get(parent) || 0) + 1);
      }
      addReadableLabel(element);
    });
    parentCounts.forEach(function (count, parent) {
      var className = typeof parent.className === 'string' ? parent.className : '';
      var tokens = className.split(' ');
      var horizontalFlex = tokens.some(function (token) { return token === 'flex' || token.endsWith(':flex'); });
      var verticalFlex = tokens.some(function (token) { return token === 'flex-col' || token.endsWith(':flex-col'); });
      var dropdownPanel = className.indexOf('dropdown') >= 0 || className.indexOf('panel') >= 0 || className.indexOf('desktop-dropdown-links') >= 0;
      if (count >= 2 && parent !== nav && horizontalFlex && !verticalFlex && !dropdownPanel && !parent.classList.contains('mobile-menu-glass')) {
        parent.classList.add('sitewide-glass-menu');
      }
    });
    document.querySelectorAll('.mobile-menu-glass').forEach(function (menu) {
      menu.classList.add('sitewide-glass-menu');
      menu.querySelectorAll('a, button').forEach(addReadableLabel);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
})();
