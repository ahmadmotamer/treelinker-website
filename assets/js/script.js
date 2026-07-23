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

  // ---------- Delete account form ----------
  const deleteForm   = document.getElementById('delete-form');
  const deleteStatus = document.getElementById('delete-status');
  const deleteBtn    = document.getElementById('delete-btn');

  // Replace with your deployed Worker URL
  const DELETE_ACCOUNT_URL = 'https://treelinker-delete-account.ahmedmosttamer.workers.dev';

  if (deleteForm) {
    deleteForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const email    = (document.getElementById('del-email').value    || '').trim();
      const password = (document.getElementById('del-password').value || '');

      if (!email || !password) {
        showAlert(deleteStatus, 'error', 'Please enter your email and password.');
        return;
      }

      deleteBtn.disabled = true;
      deleteBtn.textContent = 'Deleting…';
      if (deleteStatus) deleteStatus.hidden = true;

      try {
        const res  = await fetch(DELETE_ACCOUNT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (data.success) {
          deleteForm.hidden = true;
          showAlert(deleteStatus, 'success',
            'Your account has been permanently deleted. We\'re sorry to see you go.');
        } else {
          showAlert(deleteStatus, 'error', data.reason || 'Something went wrong. Please try again.');
          deleteBtn.disabled = false;
          deleteBtn.textContent = 'Permanently Delete My Account';
        }
      } catch {
        showAlert(deleteStatus, 'error', 'Could not reach the server. Please check your connection and try again.');
        deleteBtn.disabled = false;
        deleteBtn.textContent = 'Permanently Delete My Account';
      }
    });
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
