'use strict';
/* Auditoría de la página publicada en local: enlaces, JSON-LD, recursos y tamaño. */
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(raiz, 'styles.css'), 'utf8');
const app = fs.readFileSync(path.join(raiz, 'app.js'), 'utf8');
const radar = fs.readFileSync(path.join(raiz, 'src', 'radar.js'), 'utf8');

const lineas = s => s.split('\n').length;
const enlaces = html.match(/<a [^>]*href="(https:\/\/plataformaia\.com[^"]*)"/g) || [];
const textos = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const filas = [
  ['Enlaces salientes a plataformaia.com', enlaces.length, enlaces.length >= 7 ? 'OK' : 'FALLA'],
  ['Apariciones de nofollow', (html.match(/nofollow/gi) || []).length, /nofollow/i.test(html) ? 'FALLA' : 'OK'],
  ['Recursos remotos (CDN, fuentes, imágenes)', (html.match(/(src|href)="https?:\/\/(?!plataformaia\.com|github\.com|caseroclaw\.github\.io)[^"]+"/g) || []).length, 'revisar'],
  ['Palabras de contenido', textos.split(' ').length, '> 900'],
  ['Líneas index.html', lineas(html), '< 400'],
  ['Líneas app.js', lineas(app), '< 200'],
  ['Líneas src/radar.js', lineas(radar), '< 400'],
  ['Líneas styles.css', lineas(css), '< 250'],
  ['Casos de uso en el catálogo', require('../src/radar.js').CASOS.length, '>= 25']
];

let fallos = 0;
filas.forEach(([nombre, valor, criterio]) => {
  if (criterio === 'FALLA') fallos++;
  console.log(String(nombre).padEnd(45, '.') + ' ' + String(valor).padStart(6) + '   ' + criterio);
});

const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
try {
  const d = JSON.parse(jsonLd[1]);
  console.log('\nJSON-LD'.padEnd(45, '.') + ' ' + d['@graph'].map(x => x['@type']).join(' + '));
} catch (e) {
  fallos++;
  console.log('JSON-LD inválido: ' + e.message);
}

const remoto = (html.match(/(src|href)="https?:\/\/(?!plataformaia\.com|github\.com|caseroclaw\.github\.io)[^"]+"/g) || []);
if (remoto.length) { fallos++; console.log('Recursos remotos detectados: ' + remoto.join(', ')); }
if (/google-analytics|gtag|plausible|goatcounter|hotjar/i.test(html)) { fallos++; console.log('Analítica detectada'); }

console.log('\n' + (fallos ? 'FALLOS: ' + fallos : 'Todo correcto'));
process.exit(fallos ? 1 : 0);
