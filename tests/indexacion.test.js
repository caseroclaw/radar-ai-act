'use strict';
/**
 * Capa de indexación y citabilidad: robots.txt, sitemap.xml y llms.txt deben existir,
 * coincidir con la URL canónica y permitir a los motores de respuesta.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const canonica = /<link rel="canonical" href="([^"]+)"/.exec(html)[1];

test('existen robots.txt, sitemap.xml y llms.txt', () => {
  for (const fichero of ['robots.txt', 'sitemap.xml', 'llms.txt']) {
    assert.ok(fs.existsSync(path.join(raiz, fichero)), 'falta ' + fichero);
  }
});

test('robots.txt apunta al sitemap absoluto y permite los rastreadores de IA', () => {
  const robots = fs.readFileSync(path.join(raiz, 'robots.txt'), 'utf8');
  assert.ok(robots.includes('Sitemap: ' + canonica.replace(/\/?$/, '/') + 'sitemap.xml'), 'Sitemap mal referenciado');
  for (const bot of ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
    assert.ok(robots.includes('User-agent: ' + bot), 'falta el permiso explícito para ' + bot);
  }
  assert.ok(!/^Disallow: \/$/m.test(robots), 'robots.txt no debe bloquear la herramienta');
});

test('sitemap.xml declara exactamente la URL canónica', () => {
  const sitemap = fs.readFileSync(path.join(raiz, 'sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.deepEqual(locs, [canonica], 'el sitemap debe contener solo la URL canónica');
  assert.match(sitemap, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
});

test('llms.txt se presenta y enlaza a plataformaia.com sin nofollow', () => {
  const llms = fs.readFileSync(path.join(raiz, 'llms.txt'), 'utf8');
  assert.match(llms, /^# \S/, 'llms.txt debe empezar por un título H1');
  assert.ok(llms.includes(canonica), 'llms.txt debe citar la URL de la herramienta');
  const enlaces = llms.match(/https:\/\/plataformaia\.com[^\s)]*/g) || [];
  assert.ok(enlaces.length >= 3, 'llms.txt debe tener al menos 3 enlaces a plataformaia.com, tiene ' + enlaces.length);
  assert.ok(!/nofollow/i.test(llms), 'llms.txt no debe contener nofollow');
});
