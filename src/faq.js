'use strict';
/* Fuente única de las preguntas frecuentes: de aquí salen la sección visible de la
 * página y el JSON-LD FAQPage. Si divergen, los tests fallan (Google exige que la
 * respuesta estructurada exista también como texto visible). */

const FAQ = [
  {
    p: '¿Cuándo son exigibles las obligaciones de alto riesgo del AI Act?',
    r: 'Desde el 2 de diciembre de 2027 para los sistemas del Anexo III (empleo, crédito, seguros, educación, biometría, servicios esenciales, justicia, migración y policía) y desde el 2 de agosto de 2028 para los integrados en productos regulados del Anexo I. El Reglamento (UE) 2026/1744, en vigor desde el 27 de julio de 2026, aplazó esas dos fechas, que antes eran el 2 de agosto de 2026 y el 2 de agosto de 2027.'
  },
  {
    p: '¿Qué es obligatorio ya en octubre de 2026?',
    r: 'La transparencia del artículo 50, exigible desde el 2 de agosto de 2026: avisar de que se habla con una IA en el primer punto de contacto, marcar el contenido sintético y declarar los deepfakes. También siguen en vigor las prohibiciones del artículo 5 desde febrero de 2025, las obligaciones de modelos de propósito general desde agosto de 2025 y la alfabetización en IA del artículo 4.'
  },
  {
    p: '¿Un chatbot de atención al cliente es de alto riesgo?',
    r: 'No. Un chatbot comercial es riesgo limitado: le aplica el artículo 50 (informar de que es una IA) y el RGPD, no el Anexo III. Sería alto riesgo si se usara para seleccionar personal, evaluar solvencia, admitir alumnos o triar emergencias.'
  },
  {
    p: '¿Qué diferencia hay entre proveedor y responsable del despliegue?',
    r: 'El proveedor desarrolla o pone en el mercado el sistema y asume el expediente técnico, la evaluación de conformidad y el marcado CE. El responsable del despliegue lo usa profesionalmente: debe usarlo según las instrucciones, poner supervisión humana, conservar registros al menos seis meses, informar a la plantilla y notificar incidentes. Si modifica el uso previsto, pasa a ser proveedor.'
  },
  {
    p: '¿Cuánto es la multa por incumplir el Reglamento de IA?',
    r: 'Hasta 35 millones de euros o el 7 % de la facturación mundial por prácticas prohibidas, hasta 15 millones o el 3 % por incumplir obligaciones de alto riesgo, de transparencia o de modelos de propósito general, y hasta 7,5 millones o el 1 % por informar mal a las autoridades. Las pymes y startups tienen el límite en el porcentaje de facturación, no en el importe absoluto.'
  },
  {
    p: '¿Formar a la plantilla en IA tiene una multa de 15 millones?',
    r: 'No. El artículo 4 (alfabetización en IA) no figura en la lista tasada de infracciones del artículo 99.4, así que no tiene ese tope sancionador específico. La obligación existe desde el 2 de febrero de 2025 y se comprueba en auditorías, pero la multa de 15 millones o el 3 % no se aplica por ese artículo.'
  },
  {
    p: '¿Hay un clasificador del AI Act gratis y en español?',
    r: 'Sí. Este clasificador es gratuito, no pide registro y no envía datos: todo se calcula en el navegador. En español hay más herramientas gratuitas del mismo tipo (el clasificador de angelortegacastro.com, el de summumconsultoria.es y el de legalpilot.es, este último dentro de su espacio de trabajo con cuenta). Radar AI Act se diferencia en dos cosas concretas: separa en el mismo informe los deberes del proveedor y los del responsable del despliegue, y parte de un catálogo de casos de uso reales de pyme en vez de una pregunta abierta.'
  }
];

module.exports = { FAQ };
