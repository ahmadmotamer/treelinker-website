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

    // The language picker lives inside .nav-links but opens a submenu rather
    // than navigating, so it must not close the panel it sits in.
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

  // ---------- Language picker ----------
  // A disclosure, not a link. The CSS opens the menu off aria-expanded, so the
  // state a screen reader is told is the state that is actually on screen.
  const langToggle = document.querySelector('.nav-lang-toggle');
  const langMenu = document.querySelector('.nav-lang-menu');

  if (langToggle && langMenu) {
    const setLang = open => langToggle.setAttribute('aria-expanded', String(open));

    langToggle.addEventListener('click', e => {
      e.stopPropagation();
      setLang(langToggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('click', e => {
      if (!langToggle.parentNode.contains(e.target)) setLang(false);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && langToggle.getAttribute('aria-expanded') === 'true') {
        setLang(false);
        langToggle.focus();
      }
    });
  }

  // ---------- Nav lifts off the surface once the page scrolls under it ----------
  const nav = document.querySelector('.site-nav');

  if (nav) {
    const setStuck = () => nav.classList.toggle('is-stuck', window.scrollY > 8);
    setStuck();
    window.addEventListener('scroll', setStuck, { passive: true });
  }

  // ---------- Active nav link ----------
  // Pages are served extensionless (`/support`), but a link may still be
  // written `support.html`. Compare both sides in one normalised form, or the
  // state never applies to the hand-written pages.
  const normalize = p => {
    const last = String(p).split('?')[0].split('#')[0].split('/').filter(Boolean).pop() || '';
    return last.replace(/\.html$/, '') || 'index';
  };
  const current = normalize(window.location.pathname);

  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    if (normalize(href) === current) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // ---------- FAQ accordion ----------
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
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
  const deleteConfirm = document.getElementById('delete-confirm');

  // Replace with your deployed Worker URL
  const DELETE_ACCOUNT_URL = 'https://treelinker-delete-account.ahmedmosttamer.workers.dev';

  const DELETE_PHRASE = 'DELETE';

  if (deleteForm) {
    // The in-app flow asks twice before erasing an account. The web flow used
    // to erase it on the first click; it now asks for the same deliberate act.
    if (deleteConfirm && deleteBtn) {
      const syncConfirm = () => {
        deleteBtn.disabled = deleteConfirm.value.trim().toUpperCase() !== DELETE_PHRASE;
      };
      syncConfirm();
      deleteConfirm.addEventListener('input', syncConfirm);
    }

    deleteForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const email    = (document.getElementById('del-email').value    || '').trim();
      const password = (document.getElementById('del-password').value || '');

      if (!email || !password) {
        showAlert(deleteStatus, 'error', 'Please enter your email and password.');
        return;
      }

      if (deleteConfirm && deleteConfirm.value.trim().toUpperCase() !== DELETE_PHRASE) {
        showAlert(deleteStatus, 'error', `Type ${DELETE_PHRASE} in the confirmation box to continue.`);
        deleteConfirm.focus();
        return;
      }

      if (!window.confirm(
        'This permanently deletes your TreeLinker account, your family tree and every memory in it. It cannot be undone.\n\nDelete the account for ' + email + '?'
      )) return;

      deleteBtn.disabled = true;
      deleteBtn.textContent = 'Deleting…';
      if (deleteStatus) deleteStatus.hidden = true;

      const reset = () => {
        deleteBtn.disabled = false;
        deleteBtn.textContent = 'Permanently delete my account';
      };

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
          reset();
        }
      } catch {
        showAlert(deleteStatus, 'error', 'Could not reach the server. Please check your connection and try again.');
        reset();
      }
    });
  }

  // ---------- Contact form → mailto ----------
  const contactForm = document.getElementById('contact-form');
  const formStatus  = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const nameEl    = document.getElementById('name');
      const emailEl   = document.getElementById('email');
      const subjectEl = document.getElementById('subject');
      const messageEl = document.getElementById('message');

      const name    = (nameEl.value    || '').trim();
      const email   = (emailEl.value   || '').trim();
      const message = (messageEl.value || '').trim();
      // The option's label, not its value — the value is a slug, and sending it
      // produced subject lines reading "[TreeLinker] general".
      const subject = subjectEl.selectedIndex > 0
        ? subjectEl.options[subjectEl.selectedIndex].text.trim()
        : '';

      if (!name || !email || !subject || !message) {
        showAlert(formStatus, 'error', 'Please fill in all fields before sending.');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        showAlert(formStatus, 'error', 'That email address does not look right. Please check it.');
        emailEl.focus();
        return;
      }

      const body = [
        'Name: ' + name,
        'Email: ' + email,
        '',
        message,
      ].join('\n');

      const mailto =
        'mailto:treelinkerapp@gmail.com' +
        '?subject=' + encodeURIComponent('[TreeLinker] ' + subject) +
        '&body='    + encodeURIComponent(body);

      window.location.href = mailto;

      // A mailto either opens a mail client or does nothing visible at all.
      // Say what was meant to happen, and leave a way out if it did not.
      showAlert(formStatus, 'info',
        'Your email app should now be open with the message ready to send. If nothing happened, write to treelinkerapp@gmail.com directly.');
    });
  }

})();
