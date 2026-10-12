const form = document.getElementById('demo-request-form');
const email = document.getElementById('demo-email');
const button = form.querySelector('button[type="submit"]');
const status = document.getElementById('demo-status');
let pending = false;

function showError(message, invalidEmail = false) {
  status.dataset.error = 'true';
  status.textContent = message;
  if (invalidEmail) {
    email.setAttribute('aria-invalid', 'true');
    email.focus();
  }
}

email.addEventListener('input', () => {
  email.removeAttribute('aria-invalid');
  status.textContent = '';
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (pending) return;
  email.value = email.value.trim();
  email.removeAttribute('aria-invalid');
  status.textContent = '';
  status.dataset.error = 'false';
  if (!email.checkValidity()) {
    showError('Enter a valid email address.', true);
    return;
  }
  const origin = window.ROOK_CONFIG?.apiOrigin;
  if (!origin) {
    showError('Demo requests are unavailable right now. Please try again later.');
    return;
  }
  const submittedEmail = email.value;
  pending = true;
  button.disabled = true;
  email.readOnly = true;
  form.setAttribute('aria-busy', 'true');
  button.textContent = 'Requesting…';
  try {
    const response = await fetch(`${origin}/v1/demo-requests`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit',
      body: JSON.stringify({ email: submittedEmail }), signal: AbortSignal.timeout(15000),
    });
    if (response.status === 422) {
      showError('Enter a valid email address.', true);
      return;
    }
    if (response.status === 429) {
      const seconds = Number(response.headers.get('Retry-After')) || 60;
      showError(`Too many attempts. Please wait ${seconds} seconds before trying again.`);
      return;
    }
    if (response.status !== 202 || (await response.json()).status !== 'accepted') {
      showError('We could not confirm your request. Your email is still here; please try again.');
      return;
    }
    document.getElementById('demo-confirmed-email').textContent = submittedEmail;
    form.hidden = true;
    const success = document.getElementById('demo-success');
    success.hidden = false;
    success.querySelector('h2').focus();
  } catch {
    showError('Could not connect. Check your connection and try again; your email is still here.');
  } finally {
    pending = false;
    button.disabled = false;
    email.readOnly = false;
    button.textContent = 'Request demo →';
    form.removeAttribute('aria-busy');
  }
});
