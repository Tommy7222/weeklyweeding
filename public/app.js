function openModal(plan) {
    document.getElementById('modal').classList.add('active');
    document.body.style.overflow = 'hidden';
    const planSelect = document.getElementById('f-plan');
    if (plan === 'seasonal') planSelect.value = 'seasonal';
    else planSelect.value = 'cleanup';
    // close the mobile menu if it's open
    document.getElementById('nav-links').classList.remove('open');
    document.getElementById('nav-toggle').classList.remove('open');
  }

  function toggleNav() {
    document.getElementById('nav-links').classList.toggle('open');
    document.getElementById('nav-toggle').classList.toggle('open');
  }

  function closeModal() {
    document.getElementById('modal').classList.remove('active');
    document.body.style.overflow = '';
  }

  document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  async function submitForm() {
    const name = document.getElementById('f-name').value.trim();
    const phone = document.getElementById('f-phone').value.trim();
    const email = document.getElementById('f-email').value.trim();
    const address = document.getElementById('f-address').value.trim();
    const plan = document.getElementById('f-plan').value;

    if (!name || !phone || !email || !address) {
      alert('Please fill in all fields.');
      return;
    }

    const btn = document.querySelector('#form-state .btn-primary');
    const originalLabel = btn.textContent;
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, address, plan })
      });
      const data = await response.json();
      if (data.success) {
        document.getElementById('form-state').style.display = 'none';
        document.getElementById('success-state').style.display = 'block';
      } else {
        alert('Something went wrong. Please try again or call (973) 534-3941.');
        btn.textContent = originalLabel;
        btn.disabled = false;
      }
    } catch (error) {
      alert('Something went wrong. Please try again or call (973) 534-3941.');
      btn.textContent = originalLabel;
      btn.disabled = false;
    }
  }

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('nav-links').classList.remove('open');
      document.getElementById('nav-toggle').classList.remove('open');
    });
  });

  // If a gallery photo hasn't been uploaded yet, hide that card instead of
  // showing a broken image. If none load, hide the whole section.
  (function () {
    var grid = document.getElementById('gallery-grid');
    if (!grid) return;
    grid.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        var card = img.closest('.gallery-item');
        if (card) card.style.display = 'none';
        var anyLeft = Array.prototype.some.call(
          grid.querySelectorAll('.gallery-item'),
          function (c) { return c.style.display !== 'none'; }
        );
        if (!anyLeft) {
          var sec = document.getElementById('gallery');
          if (sec) sec.style.display = 'none';
        }
      });
    });
  })();
