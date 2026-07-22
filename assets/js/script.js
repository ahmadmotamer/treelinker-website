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

    // Close when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---------- Active nav link ----------
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // ---------- Contact / Support form ----------
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      const status = document.getElementById('form-status');

      btn.disabled = true;
      btn.textContent = 'Sending…';

      // Replace with your actual form endpoint
      const data = Object.fromEntries(new FormData(contactForm));

      try {
        // Simulate network delay for now
        await new Promise(r => setTimeout(r, 1000));

        // On success:
        contactForm.reset();
        showAlert(status, 'success', 'Your message has been sent. We\'ll get back to you soon!');
      } catch {
        showAlert(status, 'error', 'Something went wrong. Please try again or email us directly.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send Message';
      }
    });
  }

  // ---------- Delete-account confirmation ----------
  const deleteForm = document.getElementById('delete-form');
  if (deleteForm) {
    deleteForm.addEventListener('submit', e => {
      e.preventDefault();
      const confirmed = confirm(
        'Are you absolutely sure? This action is permanent and cannot be undone.'
      );
      if (confirmed) {
        const status = document.getElementById('delete-status');
        showAlert(status, 'success', 'Your deletion request has been received. Your account will be removed within 30 days.');
        deleteForm.reset();
      }
    });
  }

  // ---------- Utility ----------
  function showAlert(el, type, message) {
    if (!el) return;
    el.className = `alert alert-${type}`;
    el.textContent = message;
    el.removeAttribute('hidden');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
})();
