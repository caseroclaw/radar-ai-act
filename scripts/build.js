'use strict';
/* Genera index.html desde index.template.html con el contenido estático ya renderizado
 * (calendario, obligaciones, mitos y preguntas frecuentes). Así el texto se sirve en el
 * HTML, sin depender de JS: importa para Google y para que las IAs puedan citarlo.
 * Las FAQ se generan desde src/faq.js y alimentan a la vez el JSON-LD y la sección visible. */
const fs = require('node:fs');
const path = require('node:path');
const R = require('../src/radar.js');
const { FAQ } = require('../src/faq.js');

const raiz = path.join(__dirname, '..');
const tpl = fs.readFileSync(path.join(raiz, 'index.template.html'), 'utf8');

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const calendario = R.CALENDARIO.map(f =>
  `      <tr><td>${esc(f.fecha)}</td><td>${esc(f.que)}</td><td><span class="estado ${f.estado}">${f.estado}</span></td></tr>`
).join('\n');

const bloques = [
  ['Si desarrollas o vendes el sistema (proveedor de alto riesgo)', R.OBL.alto_proveedor],
  ['Si lo usas en tu empresa (responsable del despliegue de alto riesgo)', R.OBL.alto_desplegador],
  ['Si es riesgo limitado: chatbots, voz y contenido sintético (art. 50)', R.OBL.transparencia],
  ['Si es riesgo mínimo', R.OBL.minimo]
];

const obligaciones = bloques.map(([titulo, lista]) =>
  `  <h3>${esc(titulo)}</h3>\n  <ol>\n${lista.map(o => `    <li>${esc(o)}</li>`).join('\n')}\n  </ol>`
).join('\n') + `\n  <h3>En todos los casos</h3>\n  <ol>\n${R.OBL.transversal.map(o => `    <li>${esc(o)}</li>`).join('\n')}\n  </ol>`;

const mitos = R.MITOS.map(m =>
  `    <div class="mito">\n      <p class="falso">${esc(m.mito)}</p>\n      <p class="cierto">${esc(m.real)}</p>\n    </div>`
).join('\n');

/* FAQ: una sola fuente, dos salidas. */
const faqLd = FAQ.map(q =>
  `        {\n` +
  `          "@type": "Question",\n` +
  `          "name": ${JSON.stringify(q.p)},\n` +
  `          "acceptedAnswer": { "@type": "Answer", "text": ${JSON.stringify(q.r)} }\n` +
  `        }`
).join(',\n');

const faqHtml = FAQ.map(q =>
  `  <h3>${esc(q.p)}</h3>\n  <p>${esc(q.r)}</p>`
).join('\n');

const html = tpl
  .replace('<!--CALENDARIO-->', calendario)
  .replace('<!--OBLIGACIONES-->', obligaciones)
  .replace('<!--MITOS-->', mitos)
  .replace('<!--FAQ-LD-->', faqLd)
  .replace('<!--FAQ-HTML-->', faqHtml);

if (html.includes('<!--')) throw new Error('quedan marcadores sin sustituir');

/* El JSON-LD tiene que seguir siendo JSON válido después de la inyección. */
const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
const datos = JSON.parse(ld[1]);
const faqPage = datos['@graph'].find(x => x['@type'] === 'FAQPage');
if (!faqPage || faqPage.mainEntity.length !== FAQ.length) {
  throw new Error('el FAQPage generado no coincide con src/faq.js');
}

fs.writeFileSync(path.join(raiz, 'index.html'), html);
console.log('index.html generado: ' + html.split('\n').length + ' líneas, ' +
  html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length + ' palabras, ' +
  FAQ.length + ' FAQ (visibles + JSON-LD)');
