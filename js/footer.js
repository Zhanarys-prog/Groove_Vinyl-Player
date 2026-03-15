fetch('footer.html')
  .then(r => r.text())
  .then(html => {
    const mount = document.getElementById('footer-mount');
    if (!mount) return;
    mount.innerHTML = html;
    const page = window.location.pathname.split('/').pop() || 'index.html';
    mount.querySelectorAll('a[href]').forEach(a => {
      if (a.getAttribute('href') === page) a.classList.add('active');
    });
  })
  .catch(() => {});
