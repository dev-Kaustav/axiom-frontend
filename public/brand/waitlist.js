const form = document.getElementById('waitlist-form');
const status = document.getElementById('waitlist-status');
const button = form.querySelector('button[type="submit"]');
let pending = false;

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (pending) return;
  status.textContent = '';
  status.dataset.error = 'false';
  form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
  const values = Object.fromEntries(new FormData(form));
  const origin = window.ROOK_CONFIG?.apiOrigin;
  if (!origin) {
    status.dataset.error = 'true';
    status.textContent = 'Signup is unavailable right now. Please try again later or contact a founder above.';
    return;
  }
  pending = true;
  button.disabled = true;
  form.setAttribute('aria-busy', 'true');
  button.textContent = 'Joining…';
  try {
    const response = await fetch(`${origin}/v1/waitlist`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit',
      body: JSON.stringify(values), signal: AbortSignal.timeout(15000),
    });
    if (response.status === 422) {
      const body = await response.json();
      const messages = { name: 'Enter a name between 1 and 100 characters.', email: 'Enter a valid email address.', whatsapp: 'Use an international WhatsApp number starting with +, or leave it blank.' };
      const fields = [...new Set((body.detail || []).map(error => error.loc?.[1]).filter(field => messages[field]))];
      fields.forEach(field => form.elements.namedItem(field).setAttribute('aria-invalid', 'true'));
      if (fields.length) form.elements.namedItem(fields[0]).focus();
      throw new Error(fields.map(field => messages[field]).join(' ') || 'Please check your details and try again.');
    }
    if (response.status === 429) {
      const seconds = Number(response.headers.get('Retry-After')) || 60;
      throw new Error(`Too many attempts. Please wait ${seconds} seconds before trying again.`);
    }
    if (response.status !== 202) throw new Error('Signup is temporarily unavailable. Your details are still here; please try again.');
    const body = await response.json();
    if (body.status !== 'accepted') throw new Error('We could not confirm your signup. Please try again.');
    status.textContent = 'You’re on the waitlist. We’ll email you with launch updates.';
  } catch (error) {
    status.dataset.error = 'true';
    status.textContent = ['TypeError', 'TimeoutError', 'AbortError'].includes(error.name)
      ? 'Could not connect. Check your connection and try again; your details are still here.' : error.message;
  } finally {
    pending = false;
    button.disabled = false;
    button.textContent = 'Join the waitlist →';
    form.removeAttribute('aria-busy');
  }
});
