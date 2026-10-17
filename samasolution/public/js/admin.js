(function () {
  'use strict';

  /* Slug preview */
  var nameInput = document.getElementById('name');
  var slugInput = document.getElementById('slug');
  var slugPreview = document.getElementById('slugPreview');

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  if (nameInput && slugInput) {
    nameInput.addEventListener('input', function () {
      if (slugPreview) slugPreview.textContent = slugify(slugInput.value || nameInput.value) || '…';
    });
    slugInput.addEventListener('input', function () {
      if (slugPreview) slugPreview.textContent = slugify(slugInput.value || nameInput.value) || '…';
    });
  }

  /* Character counters */
  ['meta_title', 'meta_description'].forEach(function (id) {
    var field = document.getElementById(id);
    var counter = document.querySelector('[data-count-for="' + id + '"]');
    if (!field || !counter) return;
    var update = function () { counter.textContent = field.value.length; };
    field.addEventListener('input', update);
    update();
  });

  /* Suggested keywords */
  var suggest = document.querySelector('[data-suggest-keywords]');
  if (suggest) {
    suggest.addEventListener('click', function () {
      var name = (document.getElementById('name') || {}).value || '';
      var target = document.querySelector('[data-keywords]');
      if (!name || !target) return;
      var roles = ['Company', 'Agency', 'Service Provider'];
      var out = [];
      roles.forEach(function (role) {
        out.push(name + ' ' + role + ' India');
        out.push(name + ' ' + role + ' in India');
      });
      out.push(name + ' services India');
      out.push('best ' + name.toLowerCase() + ' India');
      target.value = out.join(', ');
      target.focus();
    });
  }

  /* Confirmation on destructive forms */
  document.querySelectorAll('form[data-confirm]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      if (!window.confirm(form.getAttribute('data-confirm'))) event.preventDefault();
    });
  });

  /* Copy buttons */
  document.querySelectorAll('[data-copy]').forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-copy');
      if (!value || !navigator.clipboard) return;
      navigator.clipboard.writeText(value).then(function () {
        var previous = button.textContent;
        button.textContent = 'Copied';
        setTimeout(function () { button.textContent = previous; }, 1400);
      });
    });
  });

  /* Auto-dismiss success notices */
  var notice = document.querySelector('.notice');
  if (notice && !notice.classList.contains('notice--error')) {
    setTimeout(function () { notice.style.display = 'none'; }, 6000);
  }
})();
