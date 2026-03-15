const form = document.getElementById('registerForm');
const errorBox = document.getElementById('authError');

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pw = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;

  errorBox.textContent = '';

  if (!name || !email || !pw) {
    errorBox.textContent = 'Please fill in all fields.';
    return;
  }
  if (pw.length < 8) {
    errorBox.textContent = 'Password must be at least 8 characters.';
    return;
  }
  if (pw !== confirm) {
    errorBox.textContent = 'Passwords do not match.';
    return;
  }

  const btn = form.querySelector('.auth-submit');
  btn.textContent = 'Done!';
  btn.disabled = true;
  setTimeout(() => { window.location.href = 'index.html'; }, 1200);
});
