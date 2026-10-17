(function () {
  'use strict';

  /* Header border on scroll */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Mobile menu */
  var toggle = document.getElementById('menuToggle');
  var menu = document.getElementById('mobileMenu');
  var closeBtn = document.getElementById('menuClose');

  function openMenu() {
    if (!menu) return;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var first = menu.querySelector('nav a');
    if (first) first.focus({ preventScroll: true });
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (toggle) toggle.focus({ preventScroll: true });
  }

  if (toggle) toggle.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (menu) {
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) closeMenu();
  });

  /* Market-area city search */
  var input = document.getElementById('citySearch');
  var resultsBox = document.getElementById('cityResults');
  var searchWrap = document.getElementById('marketSearch');
  var timer = null;

  function hideResults() {
    if (!resultsBox) return;
    resultsBox.classList.remove('is-open');
    resultsBox.innerHTML = '';
    if (input) input.setAttribute('aria-expanded', 'false');
  }

  function renderResults(rows) {
    if (!resultsBox) return;
    if (!rows.length) {
      resultsBox.innerHTML = '<a href="/market-area"><span>No match</span><span>Browse all</span></a>';
    } else {
      resultsBox.innerHTML = rows
        .map(function (r) {
          return (
            '<a href="' + r.url + '" role="option">' +
            '<strong>' + escapeHtml(r.city) + '</strong>' +
            '<span>' + escapeHtml(r.state) + ' · ' + escapeHtml(r.country) + '</span>' +
            '</a>'
          );
        })
        .join('');
    }
    resultsBox.classList.add('is-open');
    if (input) input.setAttribute('aria-expanded', 'true');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  if (input) {
    input.addEventListener('input', function () {
      var q = input.value.trim();
      clearTimeout(timer);
      if (q.length < 2) return hideResults();
      timer = setTimeout(function () {
        fetch('/api/market-search?q=' + encodeURIComponent(q), { headers: { Accept: 'application/json' } })
          .then(function (r) { return r.json(); })
          .then(function (data) { renderResults(data.results || []); })
          .catch(hideResults);
      }, 180);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var first = resultsBox && resultsBox.querySelector('a');
        if (first) {
          e.preventDefault();
          window.location.href = first.getAttribute('href');
        }
      }
      if (e.key === 'Escape') hideResults();
    });

    document.addEventListener('click', function (e) {
      if (searchWrap && !searchWrap.contains(e.target)) hideResults();
    });
  }

  /* Enquiry form — progressive enhancement */
  var form = document.getElementById('inquiryForm');
  var status = document.getElementById('formStatus');

  function setStatus(message, state) {
    if (!status) return;
    status.textContent = message;
    status.setAttribute('data-state', state || '');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var button = form.querySelector('button[type="submit"]');
      var data = Object.fromEntries(new FormData(form).entries());

      if (!data.name || data.name.trim().length < 2) return setStatus('Please enter your name.', 'error');
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) return setStatus('Please enter a valid email address.', 'error');
      if (!data.message || data.message.trim().length < 10) return setStatus('Please tell us a little about the project.', 'error');

      if (button) { button.disabled = true; button.style.opacity = '.6'; }
      setStatus('Sending…', '');

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) { return res.json().then(function (body) { return { ok: res.ok, body: body }; }); })
        .then(function (result) {
          if (result.ok && result.body.ok) {
            form.reset();
            setStatus('Thank you — your enquiry is with us. We will reply within one working day.', 'success');
            if (window.dataLayer) window.dataLayer.push({ event: 'inquiry_submitted' });
          } else {
            setStatus(result.body.error || 'Something went wrong. Please email us directly.', 'error');
          }
        })
        .catch(function () {
          setStatus('Network error. Please email ' + 'us directly.', 'error');
        })
        .finally(function () {
          if (button) { button.disabled = false; button.style.opacity = ''; }
        });
    });
  }

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
