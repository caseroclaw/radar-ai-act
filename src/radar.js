/* Radar AI Act — núcleo de clasificación (sin dependencias, sin red).
 * Reglamento (UE) 2024/1689 tal como queda tras el Reglamento (UE) 2026/1744
 * («Digital Omnibus» de IA, DOUE 24-07-2026, en vigor 27-07-2026).
 * Uso: navegador (window.Radar) o Node (require).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Radar = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var FECHAS = {
    prohibido: '2 de febrero de 2025',
    prohibidoNuevo: '2 de diciembre de 2026',
    gpai: '2 de agosto de 2025',
    transparencia: '2 de agosto de 2026',
    alto: '2 de diciembre de 2027',
    anexo1: '2 de agosto de 2028',
    minimo: 'sin obligaciones específicas'
  };

  var NIVELES = {
    prohibido: {
      etiqueta: 'Práctica prohibida',
      clase: 'rojo',
      resumen: 'No se puede usar ni poner en el mercado en la UE. No hay medida de mitigación que lo salve.'
    },
    alto: {
      etiqueta: 'Alto riesgo (Anexo III)',
      clase: 'naranja',
      resumen: 'Se puede usar, pero con expediente técnico, supervisión humana y registro. El plazo se aplazó a diciembre de 2027.'
    },
    anexo1: {
      etiqueta: 'Alto riesgo (Anexo I, producto regulado)',
      clase: 'naranja',
      resumen: 'La IA va dentro de un producto con legislación sectorial (sanitario, maquinaria, juguetes, ascensores, vehículos).'
    },
    transparencia: {
      etiqueta: 'Riesgo limitado (transparencia, art. 50)',
      clase: 'amarillo',
      resumen: 'Ya es exigible: hay que informar a la persona de que habla con una IA o marcar el contenido sintético.'
    },
    minimo: {
      etiqueta: 'Riesgo mínimo',
      clase: 'verde',
      resumen: 'Sin obligaciones específicas del Reglamento. Se aplican RGPD, consumo y sectorial.'
    }
  };

  // Casos de uso reales de pyme. nivel: prohibido | alto | anexo1 | transparencia | minimo
  var CASOS = [
    { id: 'scoring-social', grupo: 'Prohibido', nivel: 'prohibido', etiqueta: 'Puntuar la «confiabilidad» de personas con datos de varios contextos', ref: 'Art. 5.1.c' },
    { id: 'manipulacion', grupo: 'Prohibido', nivel: 'prohibido', etiqueta: 'Técnicas subliminales para cambiar una decisión causando un daño relevante', ref: 'Art. 5.1.a' },
    { id: 'vulnerabilidad', grupo: 'Prohibido', nivel: 'prohibido', etiqueta: 'Explotar la edad, discapacidad o situación económica para inducir una conducta', ref: 'Art. 5.1.b' },
    { id: 'biometria-categoria', grupo: 'Prohibido', nivel: 'prohibido', etiqueta: 'Categorizar personas por raza, política, religión, orientación sexual o sindicato', ref: 'Art. 5.1.g' },
    { id: 'scraping-facial', grupo: 'Prohibido', nivel: 'prohibido', etiqueta: 'Raspar fotos de internet o cámaras para crear una base de reconocimiento facial', ref: 'Art. 5.1.e' },
    { id: 'rbis-policial', grupo: 'Prohibido', nivel: 'prohibido', etiqueta: 'Identificación biométrica remota en tiempo real en espacio público por la policía', ref: 'Art. 5.1.h' },
    { id: 'emociones-trabajo', grupo: 'Prohibido', nivel: 'prohibido', etiqueta: 'Inferir emociones de trabajadores o alumnos (salvo motivo médico o de seguridad)', ref: 'Art. 5.1.f' },
    { id: 'intimas-ia', grupo: 'Prohibido', nivel: 'prohibido', fecha: 'prohibidoNuevo', etiqueta: 'Generar imágenes íntimas sin consentimiento o material de abuso infantil', ref: 'Art. 5.1 (nuevas letras, Reg. 2026/1744)' },

    { id: 'rrhh-seleccion', grupo: 'Alto riesgo — Anexo III', nivel: 'alto', etiqueta: 'Filtrar CV, evaluar candidatos, decidir promociones o despidos', ref: 'Anexo III.4 (empleo)' },
    { id: 'rrhh-monitorizar', grupo: 'Alto riesgo — Anexo III', nivel: 'alto', etiqueta: 'Monitorizar el rendimiento o el comportamiento de la plantilla', ref: 'Anexo III.4 (empleo)' },
    { id: 'credito', grupo: 'Alto riesgo — Anexo III', nivel: 'alto', etiqueta: 'Evaluar solvencia o puntuar el riesgo de impago de clientes', ref: 'Anexo III.5.b (servicios esenciales)' },
    { id: 'seguros', grupo: 'Alto riesgo — Anexo III', nivel: 'alto', etiqueta: 'Fijar primas o evaluar riesgo en seguros de vida y de salud', ref: 'Anexo III.5.c' },
    { id: 'prestaciones', grupo: 'Alto riesgo — Anexo III', nivel: 'alto', etiqueta: 'Tramitar prestaciones, ayudas o crédito público y comprobar requisitos', ref: 'Anexo III.5.a' },
    { id: 'emergencias', grupo: 'Alto riesgo — Anexo III', nivel: 'alto', etiqueta: 'Triar llamadas de emergencia o decidir el orden de atención', ref: 'Anexo III.5.d' },
    { id: 'educacion', grupo: 'Alto riesgo — Anexo III', nivel: 'alto', etiqueta: 'Admitir alumnos, corregir, orientar o vigilar exámenes', ref: 'Anexo III.3 (educación)' },
    { id: 'biometria-alto', grupo: 'Alto riesgo — Anexo III', nivel: 'alto', etiqueta: 'Reconocimiento facial o de voz para control de acceso o identificación', ref: 'Anexo III.1 (biometría)' },
    { id: 'infraestructura', grupo: 'Alto riesgo — Anexo III', nivel: 'alto', etiqueta: 'Gestionar el suministro de agua, gas, luz o la seguridad del tráfico', ref: 'Anexo III.2 (infraestructuras críticas)' },
    { id: 'justicia', grupo: 'Alto riesgo — Anexo III', nivel: 'alto', etiqueta: 'Asistir a un juez o influir en elecciones y procesos democráticos', ref: 'Anexo III.8' },
    { id: 'policia', grupo: 'Alto riesgo — Anexo III', nivel: 'alto', etiqueta: 'Apoyo a policía: perfiles, pruebas, priorización de patrullas', ref: 'Anexo III.6' },
    { id: 'migracion', grupo: 'Alto riesgo — Anexo III', nivel: 'alto', etiqueta: 'Evaluar visados, asilo o control de fronteras', ref: 'Anexo III.7' },

    { id: 'medico', grupo: 'Producto regulado — Anexo I', nivel: 'anexo1', etiqueta: 'Software sanitario o IA dentro de un producto sanitario (MDR)', ref: 'Anexo I, sección A' },
    { id: 'maquinaria', grupo: 'Producto regulado — Anexo I', nivel: 'anexo1', etiqueta: 'Componente de seguridad de máquina, ascensor, juguete o vehículo', ref: 'Anexo I, sección A' },

    { id: 'chatbot', grupo: 'Transparencia — art. 50', nivel: 'transparencia', etiqueta: 'Chatbot o asistente de voz que atiende a clientes', ref: 'Art. 50.1' },
    { id: 'contenido', grupo: 'Transparencia — art. 50', nivel: 'transparencia', etiqueta: 'Generar textos, imágenes, audio o vídeo (marketing, catálogo)', ref: 'Art. 50.2' },
    { id: 'deepfake', grupo: 'Transparencia — art. 50', nivel: 'transparencia', etiqueta: 'Publicar un vídeo o audio manipulado que parece real', ref: 'Art. 50.4' },

    { id: 'ocr-facturas', grupo: 'Riesgo mínimo', nivel: 'minimo', etiqueta: 'Leer facturas o albaranes y pasarlos al ERP', ref: 'No listado en Anexo III' },
    { id: 'spam', grupo: 'Riesgo mínimo', nivel: 'minimo', etiqueta: 'Filtro antispam o corrector ortográfico', ref: 'No listado en Anexo III' },
    { id: 'mantenimiento', grupo: 'Riesgo mínimo', nivel: 'minimo', etiqueta: 'Mantenimiento predictivo de una máquina no crítica', ref: 'No listado en Anexo III' },
    { id: 'stock', grupo: 'Riesgo mínimo', nivel: 'minimo', etiqueta: 'Previsión de demanda o reposición de stock', ref: 'No listado en Anexo III' },
    { id: 'resumen-reuniones', grupo: 'Riesgo mínimo', nivel: 'minimo', etiqueta: 'Resumir reuniones o redactar correos internos', ref: 'No listado en Anexo III' }
  ];

  var OBL = {
    prohibido: [
      'Retirar el sistema del uso y del catálogo, no solo «mitigarlo» (art. 5 no admite excepciones salvo las tasadas).',
      'Documentar la retirada: fecha, procesos afectados y sistemas alternativos.',
      'Revisar proveedores: si el proveedor te lo vende, la prohibición te alcanza igual como responsable del despliegue.'
    ],
    alto_proveedor: [
      'Sistema de gestión de riesgos durante todo el ciclo de vida (art. 9).',
      'Gobernanza de datos: conjuntos representativos, sin sesgos y documentados (art. 10).',
      'Documentación técnica según Anexo IV (art. 11) y registro automático de eventos (art. 12).',
      'Instrucciones de uso con capacidades, límites y nivel de exactitud (art. 13).',
      'Supervisión humana por diseño, con medidas de «parada» reales (art. 14).',
      'Exactitud, robustez y ciberseguridad declaradas y probadas (art. 15).',
      'Sistema de gestión de la calidad (art. 17) y evaluación de la conformidad con marcado CE y declaración UE (arts. 43, 47, 48).',
      'Alta en la base de datos europea de sistemas de alto riesgo (art. 49) y vigilancia poscomercialización (art. 72).'
    ],
    alto_desplegador: [
      'Usar el sistema conforme a las instrucciones del proveedor (art. 26.1); si lo usas fuera de uso previsto, pasas a ser proveedor (art. 25).',
      'Asignar supervisión humana a personas con competencia, autoridad y medios (art. 26.2).',
      'Cuidar los datos de entrada: que sean pertinentes y suficientes para el caso (art. 26.4).',
      'Conservar los registros generados al menos 6 meses, o el plazo que fije la ley sectorial (art. 26.6).',
      'Informar a la plantilla y a sus representantes antes de ponerlo en marcha en el trabajo (art. 26.7).',
      'Notificar al proveedor o distribuidor los riesgos graves y los incidentes (art. 26.5) y a las autoridades si hay daño.',
      'Evaluación de impacto en derechos fundamentales si estás en los supuestos del art. 27 (Administración, servicios públicos, puntos 2 a 8 del Anexo III).',
      'Registrar el sistema en la base de datos de la UE cuando seas organismo público (art. 49.3).'
    ],
    transparencia: [
      'Avisar de forma clara y en el primer punto de contacto de que se interactúa con una IA, no con una persona (art. 50.1).',
      'Marcar el contenido sintético de forma legible por máquina y detectable (art. 50.2); si el sistema ya estaba en el mercado antes del 2-8-2026, aplica el periodo transitorio del Ómnibus.',
      'Declarar el deepfake como contenido manipulado, aunque sea arte o sátira (art. 50.4).',
      'Informar a las personas expuestas a reconocimiento de emociones o categorización biométrica (art. 50.3).',
      'Revisar contratos y DPA con el proveedor: quién asume el aviso y con qué texto.'
    ],
    minimo: [
      'Nada específico del Reglamento de IA más allá de la alfabetización del art. 4.',
      'Sigue aplicando el RGPD: base jurídica, información, minimización y, si hay decisiones automatizadas, art. 22.',
      'Si más adelante el sistema evalúa personas, revisa el Anexo III antes de ampliarlo.'
    ],
    transversal: [
      'Alfabetización en IA del equipo (art. 4), exigible desde el 2-2-2025: no tiene multa propia en el art. 99.4, pero se pide en cualquier inspección.',
      'Inventario de sistemas de IA con rol (proveedor o responsable del despliegue), uso previsto y responsable interno.',
      'En España vigila la AESIA; el régimen sancionador ya está plenamente aplicable desde el 2-8-2026.'
    ]
  };

  var MULTAS = {
    prohibido: 'Hasta 35 M € o el 7 % del volumen de negocios mundial (art. 99.3), la mayor de las dos.',
    alto: 'Hasta 15 M € o el 3 % del volumen de negocios mundial (art. 99.4).',
    anexo1: 'Hasta 15 M € o el 3 % del volumen de negocios mundial (art. 99.4).',
    transparencia: 'Hasta 15 M € o el 3 % del volumen de negocios mundial (art. 99.4), que incluye el art. 50.',
    minimo: 'Sin multa específica del Reglamento de IA.'
  };

  var CALENDARIO = [
    { fecha: '1-8-2024', que: 'Entra en vigor el Reglamento (UE) 2024/1689.', estado: 'cumplido' },
    { fecha: '2-2-2025', que: 'Prácticas prohibidas (art. 5) y alfabetización en IA (art. 4).', estado: 'cumplido' },
    { fecha: '2-8-2025', que: 'Obligaciones de los proveedores de modelos de propósito general (GPAI).', estado: 'cumplido' },
    { fecha: '2-8-2026', que: 'Transparencia (art. 50), supervisión de la AESIA y régimen sancionador pleno.', estado: 'vigente' },
    { fecha: '2-12-2026', que: 'Prohibiciones nuevas: imágenes íntimas sin consentimiento y material de abuso infantil.', estado: 'próximo' },
    { fecha: '2-12-2027', que: 'Alto riesgo del Anexo III: expediente, conformidad y registro. Antes era el 2-8-2026.', estado: 'aplazado' },
    { fecha: '2-8-2028', que: 'Alto riesgo embebido en productos regulados (Anexo I). Antes era el 2-8-2027.', estado: 'aplazado' }
  ];

  var MITOS = [
    {
      mito: '«En agosto de 2026 ya me obligaba todo el reglamento de alto riesgo.»',
      real: 'No. El Reglamento (UE) 2026/1744, publicado el 24-07-2026 y en vigor desde el 27-07-2026, aplazó el Anexo III al 2-12-2027 y el Anexo I al 2-8-2028. Lo que sí entró en vigor el 2-8-2026 es la transparencia del art. 50.'
    },
    {
      mito: '«El Ómnibus deroga obligaciones, así que ya no hay que hacer nada.»',
      real: 'Aplaza fechas, no suprime deberes: gestión de riesgos, datos, documentación técnica, supervisión humana y registro siguen en el texto y se exigirán en diciembre de 2027.'
    },
    {
      mito: '«Si no formo a la plantilla me caen 15 millones.»',
      real: 'El art. 4 no está en la lista tasada del art. 99.4, así que no tiene ese techo sancionador. Se exige igual como medida de cumplimiento y sale en cualquier auditoría.'
    },
    {
      mito: '«Como soy pyme, las multas no me aplican.»',
      real: 'Se aplican, pero el art. 99.6 limita la sanción de las pymes y startups al porcentaje de facturación, no al importe absoluto en euros.'
    }
  ];

  function casoPorId(id) {
    for (var i = 0; i < CASOS.length; i++) if (CASOS[i].id === id) return CASOS[i];
    return null;
  }

  function clasificar(entrada) {
    var e = entrada || {};
    var caso = casoPorId(e.casoId) || casoPorId('ocr-facturas');
    var rol = e.rol === 'proveedor' ? 'proveedor' : 'desplegador';
    var nivel = caso.nivel;
    var extra = [];
    var refs = [caso.ref];

    if (e.emociones) {
      // Art. 5.1.f: inferir emociones en el trabajo o en centros educativos está prohibido.
      nivel = 'prohibido';
      refs = ['Art. 5.1.f'];
      extra.push('Si la inferencia de emociones es por motivos médicos o de seguridad, no es práctica prohibida: vuelve a clasificar el caso por su uso real.');
    } else if (nivel === 'minimo' && (e.interactua || e.contenido)) {
      nivel = 'transparencia';
    }

    var fecha = FECHAS[caso.fecha || nivel] || FECHAS[nivel];
    var obligaciones = [];

    if (nivel === 'prohibido') {
      obligaciones = OBL.prohibido.slice();
    } else if (nivel === 'alto' || nivel === 'anexo1') {
      obligaciones = (rol === 'proveedor' ? OBL.alto_proveedor : OBL.alto_desplegador).slice();
      refs.push(rol === 'proveedor' ? 'Arts. 8-15 y 43-49 (proveedor)' : 'Art. 26 (responsable del despliegue)');
      if (e.interactua || e.contenido) {
        obligaciones = obligaciones.concat(OBL.transparencia.slice(0, 2));
        refs.push('Art. 50 (también aplica)');
        extra.push('Este sistema es de alto riesgo y además interactúa con personas o genera contenido: se acumulan el Anexo III y el art. 50.');
      }
    } else if (nivel === 'transparencia') {
      obligaciones = OBL.transparencia.slice();
      if (!e.interactua && !e.contenido && !e.emociones) obligaciones = obligaciones.slice(0, 2);
    } else {
      obligaciones = OBL.minimo.slice();
    }

    return {
      nivel: nivel,
      etiqueta: NIVELES[nivel].etiqueta,
      clase: NIVELES[nivel].clase,
      resumen: NIVELES[nivel].resumen,
      caso: caso.etiqueta,
      fecha: fecha,
      aplazado: nivel === 'alto' || nivel === 'anexo1',
      rol: rol,
      refs: refs,
      obligaciones: obligaciones,
      transversales: OBL.transversal.slice(),
      multa: MULTAS[nivel],
      avisos: extra
    };
  }

  function informe(r) {
    var l = [];
    l.push('RADAR AI ACT — clasificación orientativa');
    l.push('Caso: ' + r.caso);
    l.push('Nivel: ' + r.etiqueta);
    l.push('Exigible: ' + r.fecha + (r.aplazado ? ' (aplazado por el Reglamento (UE) 2026/1744)' : ''));
    l.push('Rol: ' + (r.rol === 'proveedor' ? 'proveedor del sistema' : 'responsable del despliegue'));
    l.push('Base: ' + r.refs.join('; '));
    l.push('');
    l.push('Qué tienes que hacer:');
    r.obligaciones.forEach(function (o, i) { l.push((i + 1) + '. ' + o); });
    l.push('');
    l.push('Siempre, sea cual sea el nivel:');
    r.transversales.forEach(function (o, i) { l.push((i + 1) + '. ' + o); });
    l.push('');
    l.push('Sanción aplicable: ' + r.multa);
    if (r.avisos.length) { l.push(''); r.avisos.forEach(function (a) { l.push('Atención: ' + a); }); }
    l.push('');
    l.push('Orientativo, no asesoramiento jurídico. Elaborado por Plataforma IA — https://plataformaia.com');
    return l.join('\n');
  }

  return {
    FECHAS: FECHAS, NIVELES: NIVELES, CASOS: CASOS, OBL: OBL, MULTAS: MULTAS,
    CALENDARIO: CALENDARIO, MITOS: MITOS,
    casoPorId: casoPorId, clasificar: clasificar, informe: informe
  };
});
