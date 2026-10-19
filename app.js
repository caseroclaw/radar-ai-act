/* Radar AI Act — interfaz. Sin dependencias, sin red. */
(function () {
  'use strict';
  var R = window.Radar;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var sel = document.getElementById('caso');
  var grupos = [];
  R.CASOS.forEach(function (c) {
    if (grupos.indexOf(c.grupo) === -1) grupos.push(c.grupo);
  });
  grupos.forEach(function (g) {
    var og = document.createElement('optgroup');
    og.label = g;
    R.CASOS.filter(function (c) { return c.grupo === g; }).forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.id;
      o.textContent = c.etiqueta;
      og.appendChild(o);
    });
    sel.appendChild(og);
  });
  sel.value = 'chatbot';

  var ultimo = null;

  function pintar(r) {
    var fechaNota = r.aplazado
      ? ' <span class="nota">(antes 2-8-2026 / 2-8-2027; aplazado por el Reglamento (UE) 2026/1744)</span>'
      : '';
    var html = '';
    html += '<p class="sello ' + esc(r.clase) + '">' + esc(r.etiqueta) + '</p>';
    html += '<p class="caso"><strong>Caso:</strong> ' + esc(r.caso) + '</p>';
    html += '<p class="fecha"><strong>Exigible:</strong> ' + esc(r.fecha) + fechaNota + '</p>';
    html += '<p class="resumen">' + esc(r.resumen) + '</p>';
    html += '<p class="roles"><strong>Tu papel:</strong> ' + (r.rol === 'proveedor' ? 'proveedor (desarrollas o vendes el sistema)' : 'responsable del despliegue (lo usas en tu empresa)') + '</p>';
    html += '<p class="base"><strong>Base:</strong> ' + esc(r.refs.join(' · ')) + '</p>';
    r.avisos.forEach(function (a) { html += '<p class="aviso-inline">' + esc(a) + '</p>'; });
    html += '<h3>Qué tienes que hacer</h3><ol>';
    r.obligaciones.forEach(function (o) { html += '<li>' + esc(o) + '</li>'; });
    html += '</ol><h3>Siempre, sea cual sea el nivel</h3><ol>';
    r.transversales.forEach(function (o) { html += '<li>' + esc(o) + '</li>'; });
    html += '</ol><p class="multa"><strong>Si fallas:</strong> ' + esc(r.multa) + '</p>';
    document.getElementById('ficha').innerHTML = html;
    document.getElementById('resultado').hidden = false;
    document.getElementById('copiado').hidden = true;
  }

  function leer() {
    return {
      casoId: sel.value,
      rol: (document.querySelector('input[name="rol"]:checked') || {}).value || 'desplegador',
      interactua: document.getElementById('interactua').checked,
      contenido: document.getElementById('contenido').checked,
      emociones: document.getElementById('emociones').checked
    };
  }

  document.getElementById('formulario').addEventListener('submit', function (ev) {
    ev.preventDefault();
    ultimo = R.clasificar(leer());
    pintar(ultimo);
    document.getElementById('resultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('copiar').addEventListener('click', function () {
    if (!ultimo) return;
    var texto = R.informe(ultimo);
    var fin = function () { document.getElementById('copiado').hidden = false; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(fin, fin);
    } else {
      var ta = document.createElement('textarea');
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) { /* sin soporte */ }
      document.body.removeChild(ta);
      fin();
    }
  });
})();
