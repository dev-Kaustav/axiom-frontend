import { cp, mkdir, writeFile } from 'node:fs/promises';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import { Metadata } from 'libphonenumber-js/core';
import metadataJson from 'libphonenumber-js/metadata.max.json';

export async function buildPhoneAssets(destination) {
  const metadata = new Metadata(metadataJson);
  const names = new Intl.DisplayNames(['en'], { type: 'region' });
  const countries = getCountries().map(code => {
    metadata.selectNumberingPlan(code);
    // WhatsApp onboarding uses mobile lengths, including countries whose
    // fixed-line and mobile plans are identical (for example, the US).
    const lengths = metadata.type('MOBILE')?.possibleLengths() || metadata.possibleLengths();
    return { code, name: names.of(code), dial: getCountryCallingCode(code), lengths };
  }).sort((a, b) => a.name.localeCompare(b.name, 'en'));
  await mkdir(new URL('flags/', destination), { recursive: true });
  await cp(new URL('../node_modules/libphonenumber-js/bundle/libphonenumber-max.js', import.meta.url), new URL('libphonenumber.js', destination));
  await writeFile(new URL('countries.js', destination), `window.ROOK_PHONE_COUNTRIES = ${JSON.stringify(countries)};\n`);
  for (const { code } of countries) {
    const flagCode = { AC: 'sh-ac', TA: 'sh-ta' }[code] || code.toLowerCase();
    await cp(new URL(`../node_modules/flag-icons/flags/4x3/${flagCode}.svg`, import.meta.url), new URL(`flags/${code.toLowerCase()}.svg`, destination));
  }
  await cp(new URL('../node_modules/libphonenumber-js/LICENSE', import.meta.url), new URL('LIBPHONENUMBER-LICENSE.txt', destination));
  await cp(new URL('../node_modules/flag-icons/LICENSE', import.meta.url), new URL('FLAGS-LICENSE.txt', destination));
}
