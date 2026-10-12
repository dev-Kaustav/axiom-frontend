const form = document.getElementById('waitlist-form');
const status = document.getElementById('waitlist-status');
const button = form.querySelector('button[type="submit"]');
const phone = document.getElementById('waitlist-whatsapp');
const country = document.getElementById('waitlist-country');
const phoneHelp = document.getElementById('waitlist-phone-help');
const phoneError = document.getElementById('waitlist-phone-error');
const countries = window.ROOK_PHONE_COUNTRIES;
const { AsYouType, parsePhoneNumberFromString, parseDigits } = window.libphonenumber;
let phoneTouched = false;
let pending = false;

for (const entry of countries) {
  country.add(new Option(`${entry.name} (+${entry.dial})`, entry.code));
}
country.options[0].remove();
country.value = 'US';

const selectedCountry = () => countries.find(entry => entry.code === country.value);
const digitDescription = lengths => lengths.length === 1 ? `${lengths[0]}`
  : lengths.every((length, index) => !index || length === lengths[index - 1] + 1)
    ? `${lengths[0]}–${lengths.at(-1)}` : `${lengths.slice(0, -1).join(', ')} or ${lengths.at(-1)}`;

function validatePhone(showError = phoneTouched) {
  const entry = selectedCountry();
  let message = '';
  if (phone.value) {
    const parsed = parsePhoneNumberFromString(`+${entry.dial}${phone.value}`, { extract: false });
    if (!entry.lengths.includes(phone.value.length)) {
      message = `Enter ${digitDescription(entry.lengths)} digits for ${entry.name}.`;
    } else if (!parsed?.isValid() || (parsed.country && parsed.country !== entry.code)) {
      message = `Check the phone number for ${entry.name}, or choose a different country.`;
    }
  }
  phone.setCustomValidity(message);
  phoneError.textContent = showError ? message : '';
  phoneError.hidden = !showError || !message;
  phone.toggleAttribute('aria-invalid', showError && !!message);
  if (phone.hasAttribute('aria-invalid')) phone.setAttribute('aria-invalid', 'true');
  return message;
}

function updateCountry() {
  const entry = selectedCountry();
  document.getElementById('waitlist-country-flag').src = `/brand/phone/flags/${entry.code.toLowerCase()}.svg`;
  document.getElementById('waitlist-dial-code').textContent = `+${entry.dial}`;
  phone.maxLength = Math.min(Math.max(...entry.lengths), 15 - entry.dial.length);
  phoneHelp.textContent = `Enter ${digitDescription(entry.lengths)} digits. Country code is added automatically.`;
  validatePhone();
}

function acceptPhoneInput(value) {
  let digits = parseDigits(value);
  if (value.trim().startsWith('+')) {
    const parsed = parsePhoneNumberFromString(value, { extract: false });
    if (parsed) {
      const detected = parsed.country || countries.find(entry => entry.dial === parsed.countryCallingCode)?.code;
      if (detected) {
        country.value = detected;
        digits = parsed.nationalNumber;
        updateCountry();
      }
    }
  } else {
    // Accept pasted local formatting and national trunk prefixes as well.
    const parsed = parsePhoneNumberFromString(digits, country.value);
    if (parsed?.isValid()) digits = parsed.nationalNumber;
    else {
      const formatter = new AsYouType(country.value);
      formatter.input(digits);
      digits = formatter.getNationalNumber() || digits;
    }
  }
  // Preserve an overlong paste so the user can correct it; never silently
  // submit a truncated number belonging to someone else.
  phone.value = digits;
  validatePhone();
}

country.addEventListener('change', updateCountry);
phone.addEventListener('input', () => acceptPhoneInput(phone.value));
phone.addEventListener('paste', event => {
  event.preventDefault();
  const text = event.clipboardData.getData('text');
  const replacesAll = phone.selectionStart === 0 && phone.selectionEnd === phone.value.length;
  acceptPhoneInput(replacesAll ? text : phone.value.slice(0, phone.selectionStart) + text + phone.value.slice(phone.selectionEnd));
});
phone.addEventListener('blur', () => { phoneTouched = true; validatePhone(); });
phone.addEventListener('invalid', () => { phoneTouched = true; validatePhone(); });
updateCountry();

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (pending) return;
  status.textContent = '';
  status.dataset.error = 'false';
  form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
  phoneTouched = true;
  const phoneMessage = validatePhone(true);
  if (phoneMessage) {
    status.dataset.error = 'true';
    status.textContent = phoneMessage;
    phone.focus();
    return;
  }
  const values = Object.fromEntries(new FormData(form));
  values.whatsapp = phone.value ? `+${selectedCountry().dial}${phone.value}` : null;
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
      const messages = { name: 'Enter a name between 1 and 100 characters.', email: 'Enter a valid email address.', whatsapp: 'Check your WhatsApp number and selected country, or leave it blank.' };
      const fields = [...new Set((body.detail || []).map(error => error.loc?.[1]).filter(field => messages[field]))];
      fields.forEach(field => form.elements.namedItem(field).setAttribute('aria-invalid', 'true'));
      if (fields.includes('whatsapp')) {
        phoneError.textContent = messages.whatsapp;
        phoneError.hidden = false;
      }
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
