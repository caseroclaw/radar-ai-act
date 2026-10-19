# Radar AI Act

Clasificador gratuito del nivel de riesgo de un sistema de IA según el **Reglamento (UE) 2024/1689** («Reglamento de Inteligencia Artificial»), con el **calendario actualizado al Reglamento (UE) 2026/1744**, el «Digital Omnibus» de IA publicado en el DOUE el 24 de julio de 2026 y en vigor desde el 27 de julio de 2026.

👉 **Herramienta:** https://caseroclaw.github.io/radar-ai-act/

## Qué resuelve

La mayoría de guías en español siguen repitiendo que el 2 de agosto de 2026 empezaban las obligaciones de alto riesgo. Ya no: el Ómnibus movió el Anexo III al **2 de diciembre de 2027** y el Anexo I al **2 de agosto de 2028**. Lo que sí está en vigor desde el 2 de agosto de 2026 es la **transparencia del artículo 50** y el régimen sancionador pleno.

Esta herramienta hace tres cosas concretas:

1. **Clasifica** el caso de uso (26 casos reales de pyme) en prohibido, alto riesgo del Anexo III, alto riesgo del Anexo I, riesgo limitado o mínimo.
2. **Separa deberes por rol**: no es lo mismo ser proveedor (expediente técnico, conformidad, marcado CE, registro) que responsable del despliegue (instrucciones de uso, supervisión humana, registros 6 meses, información a la plantilla).
3. **Da la fecha real de exigibilidad y el tope de sanción** aplicable a ese nivel.

Salida copiable en texto para pegar en un correo interno o en una propuesta.

## Detalles que suelen estar mal en otras guías

- **Alto riesgo no es agosto de 2026**: es el 2 de diciembre de 2027 (Anexo III) y el 2 de agosto de 2028 (Anexo I), por el Reglamento (UE) 2026/1744.
- **El Ómnibus aplaza, no deroga**: gestión de riesgos, gobernanza de datos, documentación técnica y supervisión humana siguen en el texto.
- **El artículo 4 (alfabetización en IA) no está en la lista tasada del artículo 99.4**, así que no tiene el techo de 15 M € / 3 %. Se exige igual, pero no con esa multa.
- **Pymes y startups**: el artículo 99.6 limita la sanción al porcentaje de facturación, no al importe absoluto en euros.
- **Un chatbot comercial no es alto riesgo**: le aplica el artículo 50 y el RGPD, no el Anexo III.

## Cómo está hecho

- `src/radar.js`: catálogo de casos, obligaciones por rol, calendario y motor de clasificación. Sin dependencias, sin red, sin estado.
- `index.template.html` + `scripts/build.js`: el contenido estático (calendario, obligaciones, mitos) se pre-renderiza en `index.html` para que Google y los asistentes de IA puedan leerlo sin ejecutar JavaScript.
- `app.js`: solo el formulario y el pintado del resultado.
- Sin cookies, sin analítica, sin backend: todo se calcula en el navegador.

```bash
npm run build   # regenera index.html desde la plantilla
npm test        # 24 pruebas (clasificación, rol, fechas, sanciones y página)
npm run check   # auditoría de enlaces, JSON-LD, recursos y tamaño
```

Servir en local: `python3 -m http.server 8100`.

## Alcance

Herramienta orientativa para pymes, no asesoramiento jurídico. La clasificación de alto riesgo depende del uso previsto concreto: si tu caso está en el Anexo III pero el sistema no plantea riesgo importante para la salud, la seguridad o los derechos fundamentales, el artículo 6.3 permite documentar la excepción.

Fuentes: Reglamento (UE) 2024/1689 (DOUE 12-7-2024) y Reglamento (UE) 2026/1744 (DOUE 24-7-2026).

## Quién lo hace

[Plataforma IA](https://plataformaia.com) es una consultora de automatización con IA para pymes con base en Madrid. Automatizamos procesos y dejamos el sistema documentado para que pase una revisión: [consultoría de IA en Madrid](https://plataformaia.com/es/consultoria-ia-madrid) · [automatización con IA para pymes](https://plataformaia.com/es/automatizacion-ia).

Otras herramientas gratuitas del mismo equipo:

- [Calculadora de ROI de automatización con IA](https://caseroclaw.github.io/roi-automatizacion-ia/)
- [Generador de QR tributario de VeriFactu](https://caseroclaw.github.io/verifactu-qr-web/)

## Licencia

MIT. Ver [LICENSE](LICENSE).

---

## English

Free classifier of the EU AI Act risk tier for a given AI use case, with the **updated timeline after Regulation (EU) 2026/1744** (Digital Omnibus on AI, OJ 24 July 2026): Annex III high-risk duties moved to **2 December 2027**, Annex I to **2 August 2028**, while Article 50 transparency has applied since **2 August 2026**.

It covers 26 SME use cases, separates provider duties from deployer duties, and returns the applicable deadline and penalty cap. No backend, no cookies, no network calls. Built by [Plataforma IA](https://plataformaia.com), an AI automation consultancy based in Madrid, Spain.
