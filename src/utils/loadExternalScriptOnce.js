// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const pending = new Map();

export function loadExternalScriptOnce({ id, src }) {
  if (!src) return Promise.reject(new Error('Missing script src'));

  const existingById = id ? document.getElementById(id) : null;
  if (existingById && existingById.tagName === 'SCRIPT') return Promise.resolve();

  const existingBySrc = Array.from(document.querySelectorAll('script')).find((s) => s.src === src);
  if (existingBySrc) return Promise.resolve();

  const key = id || src;
  if (pending.has(key)) return pending.get(key);

  const p = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    if (id) script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed loading script ${src}`));
    document.head.appendChild(script);
  }).finally(() => pending.delete(key));

  pending.set(key, p);
  return p;
}


