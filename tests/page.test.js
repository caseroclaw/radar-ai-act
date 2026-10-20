'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');

test('página: enlaza a plataformaia.com al menos 7 veces', () => {
  const enlaces = html.match(/https:\/\/plataformaia\.com[^"'\s>]*/g) || [];
  assert.ok(enlaces.length >= 7, 'solo ' + enlaces.length + ' enlaces');
});

test('página: ningún nofollow y ningún recurso remoto', () => {
  assert.strictEqual((html.match(/nofollow/gi) || []).length, 0);
  const remotos = html.match(/(src|href)="http[^"]*"/g) || [];
  const permitidos = remotos.filter(r => /plataformaia\.com|github\.com|schema\.org|github\.io/.test(r));
  assert.strictEqual(remotos.length, permitidos.length, 'recursos remotos: ' + remotos.filter(r => !permitidos.includes(r)).join(', '));
});

test('página: JSON-LD válido con WebApplication y FAQPage sincronizado con src/faq.js', () => {
  const { FAQ } = require('../src/faq.js');
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(m, 'sin JSON-LD');
  const datos = JSON.parse(m[1]);
  const tipos = datos['@graph'].map(x => x['@type']);
  assert.ok(tipos.includes('WebApplication'));
  assert.ok(tipos.includes('FAQPage'));
  const faq = datos['@graph'].find(x => x['@type'] === 'FAQPage');
  assert.strictEqual(faq.mainEntity.length, FAQ.length);
  assert.ok(FAQ.length >= 7, 'se esperaban al menos 7 preguntas');
  faq.mainEntity.forEach(q => {
    assert.ok(q.name.length > 15 && q.acceptedAnswer.text.length > 80, 'respuesta floja: ' + q.name);
  });
});

test('página: cada respuesta del FAQPage existe también como texto visible', () => {
  const { FAQ } = require('../src/faq.js');
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ');
  FAQ.forEach(q => {
    const trozo = q.r.replace(/\s+/g, ' ').slice(0, 60);
    assert.ok(visible.includes(trozo), 'respuesta del schema no visible en la página: ' + q.p);
  });
  assert.match(html, /<section class="panel" id="faq">/);
});

test('página: bloques de intención y comparativa presentes', () => {
  assert.match(html, /id="para-quien"/);
  assert.match(html, /No te sirve si/);
  assert.match(html, /modelos de propósito general/);
  assert.match(html, /id="comparativa"/);
  assert.match(html, /angelortegacastro\.com/);
  assert.match(html, /summumconsultoria\.es/);
  assert.match(html, /legalpilot\.es/);
  assert.match(html, /id="citar"/);
  assert.match(html, /Actualizado el 20 de octubre de 2026/);
});

test('página: el calendario cita el Ómnibus y el 2 de diciembre de 2027', () => {
  assert.match(html, /2026\/1744/);
  assert.match(html, /2 de diciembre de 2027/);
  assert.match(html, /2 de agosto de 2028/);
});

test('página: aviso de transparencia vigente desde el 2 de agosto de 2026', () => {
  assert.match(html, /2 de agosto de 2026/);
  assert.match(html, /artículo 50|art\. 50/);
});

test('página: enlaza las otras dos herramientas del mismo dominio', () => {
  assert.match(html, /caseroclaw\.github\.io\/roi-automatizacion-ia/);
  assert.match(html, /caseroclaw\.github\.io\/verifactu-qr-web/);
});

test('página: calendario pre-renderizado y sincronizado con el núcleo', () => {
  const R = require('../src/radar.js');
  const filas = html.match(/<tr><td>\d+-/g) || [];
  assert.strictEqual(filas.length, R.CALENDARIO.length, 'filas del calendario desincronizadas: ejecuta npm run build');
  assert.doesNotMatch(html, /<!--(CALENDARIO|MITOS|OBLIGACIONES)-->/);
});

test('página: el texto de obligaciones está en el HTML, no solo en JS', () => {
  assert.match(html, /marcado CE/);
  assert.match(html, /al menos 6 meses/);
  assert.match(html, /Anexo IV/);
  assert.match(html, /primer punto de contacto/);
});

test('página: scripts locales y sin analítica ni cookies', () => {
  const scripts = html.match(/<script[^>]*src="([^"]+)"/g) || [];
  scripts.forEach(s => assert.ok(/src="(src\/radar\.js|app\.js)"/.test(s), 'script inesperado: ' + s));
  assert.doesNotMatch(html, /google-analytics|gtag|plausible|goatcounter|hotjar/i);
  assert.doesNotMatch(html, /document\.cookie/);
});
