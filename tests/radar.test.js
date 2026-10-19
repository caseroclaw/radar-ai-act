'use strict';
const test = require('node:test');
const assert = require('node:assert');
const R = require('../src/radar.js');

test('catálogo de casos coherente', () => {
  const ids = R.CASOS.map(c => c.id);
  assert.strictEqual(new Set(ids).size, ids.length, 'ids duplicados');
  assert.ok(R.CASOS.length >= 25, 'pocos casos');
  R.CASOS.forEach(c => {
    assert.ok(c.etiqueta && c.grupo && c.ref, 'caso incompleto: ' + c.id);
    assert.ok(R.NIVELES[c.nivel], 'nivel desconocido en ' + c.id);
  });
});

test('práctica prohibida: fecha, sanción y obligación de retirar', () => {
  const r = R.clasificar({ casoId: 'scoring-social' });
  assert.strictEqual(r.nivel, 'prohibido');
  assert.match(r.fecha, /2 de febrero de 2025/);
  assert.match(r.multa, /35/);
  assert.match(r.obligaciones.join(' '), /Retirar/);
});

test('prohibiciones nuevas del Ómnibus: 2 de diciembre de 2026', () => {
  const r = R.clasificar({ casoId: 'intimas-ia' });
  assert.strictEqual(r.nivel, 'prohibido');
  assert.match(r.fecha, /2 de diciembre de 2026/);
});

test('alto riesgo como responsable del despliegue: art. 26 y 6 meses', () => {
  const r = R.clasificar({ casoId: 'rrhh-seleccion', rol: 'desplegador' });
  assert.strictEqual(r.nivel, 'alto');
  assert.match(r.fecha, /2 de diciembre de 2027/);
  assert.ok(r.aplazado);
  const t = r.obligaciones.join(' ');
  assert.match(t, /6 meses/);
  assert.match(t, /26\.7/);
  assert.doesNotMatch(t, /marcado CE/);
});

test('alto riesgo como proveedor: Anexo IV, conformidad y registro', () => {
  const r = R.clasificar({ casoId: 'credito', rol: 'proveedor' });
  const t = r.obligaciones.join(' ');
  assert.match(t, /Anexo IV/);
  assert.match(t, /marcado CE/);
  assert.match(t, /base de datos europea/);
});

test('alto riesgo + interacción con personas acumula el art. 50', () => {
  const r = R.clasificar({ casoId: 'rrhh-seleccion', rol: 'desplegador', interactua: true });
  const t = r.obligaciones.join(' ');
  assert.match(t, /art\. 50\.1/);
  assert.ok(r.refs.some(x => /Art\. 50/.test(x)));
  assert.strictEqual(r.avisos.length, 1);
});

test('chatbot: riesgo limitado y exigible desde agosto de 2026', () => {
  const r = R.clasificar({ casoId: 'chatbot' });
  assert.strictEqual(r.nivel, 'transparencia');
  assert.match(r.fecha, /2 de agosto de 2026/);
  assert.strictEqual(r.aplazado, false);
  assert.match(r.multa, /15 M/);
});

test('riesgo mínimo: sin obligaciones específicas', () => {
  const r = R.clasificar({ casoId: 'ocr-facturas' });
  assert.strictEqual(r.nivel, 'minimo');
  assert.match(r.multa, /Sin multa/);
  assert.ok(r.transversales.some(o => /art\. 4/.test(o)));
});

test('un caso mínimo que genera contenido sube a transparencia', () => {
  const r = R.clasificar({ casoId: 'resumen-reuniones', contenido: true });
  assert.strictEqual(r.nivel, 'transparencia');
  assert.match(r.fecha, /2 de agosto de 2026/);
});

test('inferir emociones convierte el caso en prohibido con aviso', () => {
  const r = R.clasificar({ casoId: 'chatbot', emociones: true });
  assert.strictEqual(r.nivel, 'prohibido');
  assert.deepStrictEqual(r.refs, ['Art. 5.1.f']);
  assert.match(r.avisos.join(' '), /médicos o de seguridad/);
});

test('caso inexistente cae en un caso válido, sin romper', () => {
  const r = R.clasificar({ casoId: 'no-existe' });
  assert.ok(R.NIVELES[r.nivel]);
  assert.ok(r.obligaciones.length > 0);
});

test('Anexo I: producto regulado, 2028', () => {
  const r = R.clasificar({ casoId: 'medico', rol: 'proveedor' });
  assert.strictEqual(r.nivel, 'anexo1');
  assert.match(r.fecha, /2 de agosto de 2028/);
});

test('calendario: siete hitos y el aplazamiento visible', () => {
  assert.strictEqual(R.CALENDARIO.length, 7);
  const a = R.CALENDARIO.find(x => x.fecha === '2-12-2027');
  assert.ok(a && /2-8-2026/.test(a.que));
  assert.strictEqual(R.CALENDARIO.filter(x => x.estado === 'vigente').length, 1);
});

test('mitos: cuatro correcciones y la del art. 4', () => {
  assert.strictEqual(R.MITOS.length, 4);
  assert.ok(R.MITOS.some(m => /art\. 4|artículo 4/.test(m.real) && /99\.4/.test(m.real)));
});

test('informe copiable: incluye caso, nivel, fecha y la marca', () => {
  const r = R.clasificar({ casoId: 'rrhh-monitorizar' });
  const t = R.informe(r);
  assert.match(t, /RADAR AI ACT/);
  assert.match(t, /Nivel: Alto riesgo/);
  assert.match(t, /2 de diciembre de 2027/);
  assert.match(t, /plataformaia\.com/);
  assert.match(t, /responsable del despliegue/);
});
