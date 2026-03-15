fetch('header.html')
  .then(r => r.text())
  .then(html => {
    const mount = document.getElementById('header-mount');
    if (!mount) return;
    mount.innerHTML = html;
    const page = window.location.pathname.split('/').pop() || 'index.html';
    mount.querySelectorAll('a[href]').forEach(a => {
      if (a.getAttribute('href') === page) a.classList.add('active');
    });
  })
  .catch(() => {});

function initBurger() {
  const burger = document.getElementById('navBurger');
  const nav = document.getElementById('siteNav');
  if (!burger || !nav) return;
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('nav-open');
    burger.classList.toggle('burger-open', open);
  });
  document.addEventListener('click', e => {
    if (!burger.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('nav-open');
      burger.classList.remove('burger-open');
    }
  });
}

const observer = new MutationObserver(() => {
  if (document.getElementById('navBurger')) {
    initBurger();
    observer.disconnect();
  }
});
observer.observe(document.body, { childList: true, subtree: true });
