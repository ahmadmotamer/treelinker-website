/* =========================================
   TreeLinker – Main JavaScript
   ========================================= */

(function () {
  'use strict';

  // ---------- Mobile nav toggle ----------
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', e => {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---------- Active nav link ----------
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentFile || (currentFile === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // ---------- Utility ----------
  function showAlert(el, type, message) {
    if (!el) return;
    el.className = `alert alert-${type}`;
    el.textContent = message;
    el.removeAttribute('hidden');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ---------- Contact form → mailto ----------
  const contactForm = document.getElementById('contact-form');
  const formStatus  = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name    = (document.getElementById('name').value    || '').trim();
      const email   = (document.getElementById('email').value   || '').trim();
      const subject = (document.getElementById('subject').value || '').trim();
      const message = (document.getElementById('message').value || '').trim();

      if (!name || !email || !subject || !message) {
        showAlert(formStatus, 'error', 'Please fill in all fields before sending.');
        return;
      }

      const body = [
        'Name: ' + name,
        'Email: ' + email,
        '',
        message,
      ].join('\n');

      const mailto =
        'mailto:ahmedmosttamer@gmail.com' +
        '?subject=' + encodeURIComponent('[TreeLinker] ' + subject) +
        '&body='    + encodeURIComponent(body);

      window.location.href = mailto;
    });
  }

})();
