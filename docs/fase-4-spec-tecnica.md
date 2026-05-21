# Fase 4 — Especificación técnica

## Sitio web profesional — Profe Pippo / Lucas Jonathan Didolich

> **Documento:** Especificación técnica — artefacto de Fase 4 **Fase:** 4 — Traducción a spec técnica **Estado:** Borrador v1.1 **Depende de:** `fase-3-spec-funcional.md` v1.2, `fase-3-contenido-textos.md`, `DESIGN.md` **Próxima fase:** Fase 5 — Checkpoint humano obligatorio

---

## Tabla de contenidos

1. [[#1. Propósito del documento]]
2. [[#2. Arquitectura del sistema]]
3. [[#3. Esquema de datos]]
4. [[#4. Contratos de módulos JS]]
5. [[#5. Contratos de componentes HTML]]
6. [[#6. Configuración de Netlify]]
7. [[#7. Configuración de CI (GitHub Actions)]]
8. [[#8. Checklist de cierre de Fase 4]]

---

## 1. Propósito del documento

Este documento traduce la especificación funcional aprobada (`fase-3-spec-funcional.md` v1.2) y el contenido definitivo (`fase-3-contenido-textos.md`) en decisiones de arquitectura ejecutables. Su destinatario principal es el agente de implementación (cualquier agente compatible con `AGENTS.md`); su destinatario secundario es Osvaldo como supervisor del proceso.

El documento responde tres preguntas concretas que la spec funcional no responde:

- **Cómo se estructura el sistema** en archivos, capas y responsabilidades.
- **Qué forma tienen los datos** que el sistema manipula en runtime.
- **Qué interfaces exponen** los módulos JS entre sí.

Ninguna decisión de este documento puede contradecir la spec funcional. Si existe conflicto, la spec funcional es la fuente de verdad y este documento debe corregirse.

---

## 2. Arquitectura del sistema

### 2.1 Árbol de archivos definitivo

```
/
├── index.html                  ← página principal, una sola página HTML
├── exito.html                  ← página de confirmación post-envío de formulario
├── error.html                  ← página de error post-envío de formulario
├── favicon.svg                 ← placeholder: fondo #17181d, inicial "P" en #e09f3e
├── LICENSE                     ← licencia personalizada del proyecto
├── README.md                   ← instrucciones de setup, deploy y mantenimiento
├── netlify.toml                ← configuración de redirects y headers de seguridad
├── .github/
│   └── workflows/
│       └── ci.yml              ← pipeline de CI (html-validate, stylelint, eslint)
├── docs/
│   ├── AGENTS.md               ← constitución operativa para agentes IA
│   ├── DESIGN.md               ← autoridad visual y de diseño del proyecto
│   ├── tasklist.md             ← roadmap incremental de implementación
│   └── fase-4-spec-tecnica.md  ← documento final de especificación técnica
├── assets/
│   ├── css/
│   │   └── styles.css          ← variables CSS custom + overrides; tailwind via CDN
│   ├── js/
│   │   ├── main.js             ← orquestador: inicializa todos los submódulos
│   │   └── i18n.js             ← carga locales/es.json y resuelve atributos data-i18n
│   └── img/
│       └── profile.webp        ← foto de perfil del profesor (WebP con fallback jpg)
├── locales/
│   ├── es.json                 ← textos definitivos en español (idioma activo en v1)
│   └── en.json                 ← estructura de claves definida; valores activos en v2
```

**Notas:**

- No existe `package.json`, `node_modules`, ni ningún toolchain de build. El sitio se sirve como archivos estáticos sin compilación.
- La carpeta `assets/fonts/` no se crea en v1 porque las fuentes se cargan desde Google Fonts. Si en el futuro se sirven localmente, se agrega bajo `assets/fonts/`.
- Los archivos `.github/` y `netlify.toml` son parte del repositorio pero no se despliegan como contenido público.

---

### 2.2 Capas del sistema y sus responsabilidades

El sistema tiene cuatro capas. Cada capa tiene una responsabilidad única y no accede directamente a las responsabilidades de otra capa que no sea la inmediatamente adyacente.

```
┌─────────────────────────────────────────────────────────┐
│  CAPA 1 — CONTENIDO                                     │
│  locales/es.json · locales/en.json                      │
│  Responsabilidad: textos de la UI y metadatos           │
│  No contiene lógica. Solo datos.                        │
└───────────────────────┬─────────────────────────────────┘
                        │ consumida por
                        ▼
┌─────────────────────────────────────────────────────────┐
│  CAPA 2 — PRESENTACIÓN                                  │
│  index.html · exito.html · error.html                   │
│  Responsabilidad: estructura semántica del DOM          │
│  No contiene textos hardcodeados (usa data-i18n)        │
│  No contiene lógica de comportamiento (usa data-*)      │
└───────────────────────┬─────────────────────────────────┘
                        │ estilizada por
                        ▼
┌─────────────────────────────────────────────────────────┐
│  CAPA 3 — ESTILOS                                       │
│  assets/css/styles.css · TailwindCSS CDN                │
│  Responsabilidad: apariencia visual y layout            │
│  styles.css define variables CSS y overrides            │
│  Tailwind provee utilidades de layout y espaciado       │
└───────────────────────┬─────────────────────────────────┘
                        │ orquestada por
                        ▼
┌─────────────────────────────────────────────────────────┐
│  CAPA 4 — COMPORTAMIENTO                                │
│  assets/js/main.js · assets/js/i18n.js                  │
│  Responsabilidad: interactividad y resolución de textos │
│  main.js inicializa nav, hamburger, form, observer      │
│  i18n.js carga el locale activo y actualiza el DOM      │
└─────────────────────────────────────────────────────────┘
```

**Regla de dependencia entre capas:** la Capa 4 puede leer y modificar el DOM de la Capa 2. La Capa 3 no es accedida por JS (sin manipulación de estilos inline desde JS). La Capa 1 es consumida exclusivamente por `i18n.js`; ningún otro módulo carga archivos de localización.

---

### 2.3 Flujo de inicialización de la página

La secuencia de carga es la siguiente. El orden importa: `i18n.js` debe resolver los textos antes de que Swiper renderice las cards, porque los textos de los slides provienen de `es.json`.

```
1. El navegador parsea index.html
   ├── Carga <link> de Google Fonts (Playfair Display, Inter)
   ├── Carga <link> de Unicons CDN
   ├── Carga <link> de Swiper CDN (CSS)
   ├── Carga <link> de assets/css/styles.css
   └── Registra <script type="module" src="assets/js/main.js">

2. main.js se ejecuta como módulo ES6
   ├── import i18n from './i18n.js'
   ├── await i18n.init()                  ← fetch('/locales/es.json') + resolución data-i18n
   ├── initNav()                          ← marca ítem activo, escucha clicks de sidebar
   ├── initHamburger()                    ← toggle del menú overlay en mobile
   ├── initIntersectionObserver()         ← actualiza ítem activo al hacer scroll
   ├── initSwiper()                       ← inicializa el carousel de testimonios
   └── initForm()                         ← validación y estado del botón de envío

3. IntersectionObserver entra en operación continua
   └── Actualiza el ítem activo de nav según la sección visible
```

**Nota sobre Swiper CDN:** Swiper v11 se carga vía CDN como script separado antes del cierre de `</body>`. `main.js` asume que el objeto global `Swiper` está disponible en el momento en que `initSwiper()` se ejecuta. No se usa `import` de Swiper porque el sitio no tiene build step.

---

### 2.4 Estrategia de estilos

**TailwindCSS via CDN:** se carga el script CDN de Tailwind v3 en el `<head>`. Esto habilita todas las clases utilitarias de Tailwind en el HTML sin compilación. La contrapartida es que no hay purga de clases no utilizadas ni `tailwind.config.js`. Para este proyecto (sitio estático pequeño, sin CI de performance), el tradeoff es aceptable.

**Variables CSS custom en `styles.css`:** todos los colores de la paleta y los valores de tipografía que no son nativos de Tailwind se definen como variables CSS en `:root`. Las clases de Tailwind los referencian mediante sintaxis arbitraria.

```css
/* fragmento de styles.css */
:root {
  --color-bg: #17181d;
  --color-surface: #1f2029;
  --color-primary: #e09f3e;
  --color-secondary: #ee964b;
  --color-tertiary: #9e2a2b;
  --color-text: #ffffff;
  --color-muted: rgba(255, 255, 255, 0.75);

  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans: 'Inter', system-ui, sans-serif;

  --sidebar-width: 240px;
  --content-max: 960px;
  --form-max: 600px;
}

/* scroll suave global; se desactiva con prefers-reduced-motion */
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

**Regla de uso:** si un valor de diseño existe como variable CSS en `:root`, se usa la variable. Si Tailwind tiene una clase utilitaria equivalente, se usa la clase de Tailwind con valor arbitrario (`bg-[var(--color-bg)]`). No se hardcodean valores hexadecimales como clases arbitrarias de Tailwind sin pasar por una variable CSS.

---

## 3. Esquema de datos

### 3.1 `locales/es.json` — valores definitivos

```json
{
  "meta": {
    "title": "Profe Pippo — Instituto de Aprendizaje Musical Eufonía",
    "description": "Clases de música en Apóstoles y Azara. Piano, guitarra, saxofón y 25 instrumentos más. Todos los niveles y edades."
  },
  "nav": {
    "home": "Inicio",
    "trajectory": "Trayectoria",
    "instruments": "Instrumentos",
    "services": "Servicios",
    "testimonials": "Testimonios",
    "contact": "Contacto",
    "instagram_label": "@instituto_musical_eufonia"
  },
  "hero": {
    "title": "Profe Pippo",
    "subtitle": "Músico, docente y director del Instituto de Aprendizaje Musical Eufonía",
    "bio": "Toda mi vida estuvo marcada por la música — ejecutando, cantando, aprendiendo. Como docente encontré que cada alumno tiene su propio tiempo, y respetarlo es la clave de un aprendizaje íntegro y duradero. Porque todos podemos ser músicos.",
    "cta": "Consultar clases"
  },
  "trajectory": {
    "section_title": "Trayectoria",
    "items": [
      {
        "period": "1992",
        "title": "Inicio musical",
        "description": "Primeros estudios de piano y lectoescritura musical en Necochea, Buenos Aires, con el maestro Omar Eduardo Luayza. Primeras clases de canto y armonía vocal con Viviana Barberón."
      },
      {
        "period": "1998",
        "title": "Llegada a Misiones",
        "description": "Mudanza familiar a Apóstoles, Misiones, donde continuó su desarrollo musical de forma autónoma."
      },
      {
        "period": "2001 — 2003",
        "title": "Retoma de estudios formales",
        "description": "Estudios de armonía, lectoescritura, piano y composición con la profesora Pamela Chomik (ESMU, Posadas) en el Instituto Arco Iris, dirigido por Laura Mendoza."
      },
      {
        "period": "2004",
        "title": "Ingreso a la Tecnicatura — ESMU",
        "description": "Ingreso a la Tecnicatura de la Escuela Superior de Música en 6to año, mediante cursillo y examen integrador-nivelador."
      },
      {
        "period": "2007",
        "title": "Traslado a Neuquén",
        "description": "Nueva etapa de vida y desarrollo musical en la ciudad de Neuquén."
      },
      {
        "period": "2009 — 2010",
        "title": "Saxofón y armonía avanzada",
        "description": "Primer contacto con el saxofón bajo la guía del Maestro Andrés Gélvez. Estudios de armonía y piano avanzado con Julio Vallejos."
      },
      {
        "period": "2012",
        "title": "Inicio de la actividad docente",
        "description": "Regreso a Misiones. Comienzo de la enseñanza musical en Azara y ciudades aledañas: Garruchos, Concepción de la Sierra, San José, Colonia Liebig y Apóstoles."
      },
      {
        "period": "2016",
        "title": "Profesorado de Música",
        "description": "Ingreso al Profesorado de Música para nivel inicial, primario y secundario en el Instituto Superior San Agustín."
      },
      {
        "period": "2025",
        "title": "Egreso del Profesorado de Música",
        "description": "Finalización y egreso del Profesorado de Música — Instituto Superior San Agustín."
      },
      {
        "period": "Actualidad",
        "title": "Director — Instituto Eufonía y coros",
        "description": "Director del Coro de Niños y del Coro de Jóvenes y Adultos del Instituto Superior San Agustín. Director del Coro de la obra misionera Casa de Dios. Director del Instituto de Aprendizaje Musical Eufonía, Apóstoles."
      }
    ]
  },
  "instruments": {
    "section_title": "Instrumentos",
    "items": [
      "Piano",
      "Guitarra",
      "Bajo",
      "Batería",
      "Flauta dulce",
      "Ukulele",
      "Clarinete",
      "Saxofón",
      "Acordeón diatónica a botones",
      "Acordeón a piano",
      "Violín",
      "Viola",
      "Violoncello",
      "Contrabajo",
      "Armónica",
      "Ocarina",
      "Xilofón",
      "Metalofón",
      "Marimba",
      "Bombo legüero",
      "Cajón peruano",
      "Tumbadoras",
      "Bongó",
      "Charango",
      "Quena",
      "Pincullo",
      "Siku",
      "Arpa"
    ]
  },
  "services": {
    "section_title": "Servicios",
    "description": "Ofrezco clases presenciales individuales para alumnos de todas las edades — desde los 7 años en adelante — y todos los niveles, tanto principiantes como avanzados. Mi enfoque se basa en respetar los tiempos y procesos de cada alumno, sin quemar etapas, para lograr un desarrollo musical íntegro y duradero. Porque todos podemos aprender a hacer música.",
    "coverage": "Clases presenciales en Apóstoles y Azara, Misiones.",
    "availability_title": "Disponibilidad",
    "days": "Martes a viernes",
    "hours_morning": "08:00 a 12:00",
    "hours_afternoon": "13:00 a 22:00"
  },
  "testimonials": {
    "section_title": "Testimonios",
    "items": [
      {
        "text": "Empecé de cero, sin saber nada de música, y el Profe Pippo tuvo una paciencia increíble conmigo. Hoy puedo tocar mis primeras canciones en guitarra y no me puedo creer lo rápido que aprendí.",
        "author": "Martina G.",
        "role": "Alumna de Guitarra"
      },
      {
        "text": "Mi hijo tiene 8 años y es su primer año de clases. Lo que más me sorprendió fue cómo el profe se adaptó a su ritmo sin presionarlo. Hoy el nene espera con ansias cada clase.",
        "author": "Rodrigo P.",
        "role": "Padre de alumno"
      },
      {
        "text": "Retomé el piano después de 20 años sin tocarlo. Nunca me sentí juzgado por el tiempo que estuve sin practicar. El Profe Pippo sabe exactamente cómo motivarte y llevarte al siguiente nivel.",
        "author": "Sandra M.",
        "role": "Alumna de Piano"
      },
      {
        "text": "Quería aprender saxofón sin tener ninguna base musical previa. En pocos meses ya estaba leyendo partituras y tocando mis primeras piezas. Una experiencia que superó todas mis expectativas.",
        "author": "Carlos D.",
        "role": "Alumno de Saxofón"
      }
    ]
  },
  "form": {
    "section_title": "Contacto",
    "label_name": "Nombre y apellidos",
    "label_age": "Edad del interesado",
    "label_instrument": "Instrumento de interés",
    "instrument_placeholder": "— Seleccioná un instrumento —",
    "label_other_instrument": "Otro instrumento",
    "placeholder_other_instrument": "Especificá el instrumento",
    "label_phone": "Teléfono de contacto",
    "label_email": "Email",
    "submit_default": "ENVIAR CONSULTA",
    "submit_loading": "ENVIANDO...",
    "error_name": "Ingresá tu nombre y apellidos.",
    "error_age": "Ingresá una edad entre 7 y 100 años.",
    "error_instrument": "Seleccioná un instrumento de la lista.",
    "error_other_instrument": "Especificá el instrumento que te interesa.",
    "error_contact": "Ingresá al menos un medio de contacto (teléfono o email).",
    "error_email_format": "Ingresá un email con formato válido.",
    "privacy_note": "Los datos ingresados en este formulario son recolectados por Lucas Jonathan Didolich (Instituto Eufonía) con el único fin de responder tu consulta y coordinar clases. No serán cedidos a terceros. Podés solicitar su rectificación o eliminación en cualquier momento escribiendo a institutoeufonia@gmail.com. Ley 25.326 de Protección de Datos Personales."
  },
  "footer": {
    "name": "Profe Pippo",
    "copyright": "© 2026 Profe Pippo — Instituto de Aprendizaje Musical Eufonía. Todos los derechos reservados.",
    "instagram_label": "@instituto_musical_eufonia",
    "credits_text": "Hecho con amor y mate 🧉. ¿Te gustaría tener una web como esta?",
    "credits_link_label": "Hablemos",
    "credits_link_url": "https://osvaldo-zakowicz.netlify.app/",
    "credits_author": "Copyright © 2026 Zakowicz Osvaldo Emanuel. Todos los derechos reservados."
  },
  "success_page": {
    "title": "¡Consulta enviada!",
    "body": "Gracias por tu mensaje. El Profe Pippo se pondrá en contacto a la brevedad.",
    "cta": "Volver al inicio"
  },
  "error_page": {
    "title": "Algo salió mal",
    "body": "No pudimos enviar tu consulta. Por favor intentá de nuevo o contactanos por Instagram.",
    "cta": "Volver al formulario",
    "instagram_label": "@instituto_musical_eufonia"
  }
}
```

---

### 3.2 `locales/en.json` — estructura de claves con valores traducidos listos para v2

> **Nota de analista:** los valores de `en.json` están traducidos pero el toggle de idioma se activa en v2. El archivo existe en el repositorio desde v1 con la estructura completa para no generar deuda técnica al momento de activar el inglés. Los comentarios inline documentan las decisiones de traducción por instrumento según la regla de la spec funcional (sección 9.4).

```json
{
  "meta": {
    "title": "Profe Pippo — Instituto de Aprendizaje Musical Eufonía",
    "description": "Music lessons in Apóstoles and Azara. Piano, guitar, saxophone and 25 more instruments. All levels and ages."
  },
  "nav": {
    "home": "Home",
    "trajectory": "Trajectory",
    "instruments": "Instruments",
    "services": "Services",
    "testimonials": "Testimonials",
    "contact": "Contact",
    "instagram_label": "@instituto_musical_eufonia"
  },
  "hero": {
    "title": "Profe Pippo",
    "subtitle": "Musician, teacher and director of the Instituto de Aprendizaje Musical Eufonía",
    "bio": "Music has marked my entire life — performing, singing, learning. As a teacher I found that every student has their own pace, and respecting it is the key to a wholesome and lasting learning. Because we can all be musicians.",
    "cta": "Inquire about lessons"
  },
  "trajectory": {
    "section_title": "Trajectory",
    "items": [
      {
        "period": "1992",
        "title": "Musical beginnings",
        "description": "First studies in piano and music reading in Necochea, Buenos Aires, with maestro Omar Eduardo Luayza. First vocal harmony lessons with Viviana Barberón."
      },
      {
        "period": "1998",
        "title": "Arrival in Misiones",
        "description": "Family relocation to Apóstoles, Misiones, where he continued his musical development independently."
      },
      {
        "period": "2001 — 2003",
        "title": "Return to formal studies",
        "description": "Studies in harmony, music reading, piano and composition with Professor Pamela Chomik (ESMU, Posadas) at Instituto Arco Iris, directed by Laura Mendoza."
      },
      {
        "period": "2004",
        "title": "Enrollment in the ESMU Technician Program",
        "description": "Enrollment in the Escuela Superior de Música Technician Program at 6th year level, via preparatory course and integrative-leveling exam."
      },
      {
        "period": "2007",
        "title": "Relocation to Neuquén",
        "description": "A new chapter of life and musical development in the city of Neuquén."
      },
      {
        "period": "2009 — 2010",
        "title": "Saxophone and advanced harmony",
        "description": "First contact with the saxophone under Maestro Andrés Gélvez. Advanced harmony and piano studies with Julio Vallejos."
      },
      {
        "period": "2012",
        "title": "Start of teaching career",
        "description": "Return to Misiones. Beginning of music teaching in Azara and surrounding towns: Garruchos, Concepción de la Sierra, San José, Colonia Liebig and Apóstoles."
      },
      {
        "period": "2016",
        "title": "Music Teacher Training Program",
        "description": "Enrollment in the Music Teacher Training Program for primary and secondary levels at Instituto Superior San Agustín."
      },
      {
        "period": "2025",
        "title": "Graduation — Music Teacher",
        "description": "Completion and graduation from the Music Teacher Training Program — Instituto Superior San Agustín."
      },
      {
        "period": "Present",
        "title": "Director — Instituto Eufonía and choirs",
        "description": "Director of the Children's Choir and the Youth and Adult Choir at Instituto Superior San Agustín. Director of the choir at the missionary center Casa de Dios. Director of the Instituto de Aprendizaje Musical Eufonía, Apóstoles."
      }
    ]
  },
  "instruments": {
    "section_title": "Instruments",
    "items": [
      "Piano",
      "Guitar",
      "Bass",
      "Drums",
      "Recorder",
      "Ukulele",
      "Clarinet",
      "Saxophone",
      "Diatonic Button Accordion",
      "Piano Accordion",
      "Violin",
      "Viola",
      "Cello",
      "Double Bass",
      "Harmonica",
      "Ocarina",
      "Xylophone",
      "Metallophone",
      "Marimba",
      "Bombo Legüero",
      "Cajón Peruano",
      "Tumbadoras",
      "Bongo",
      "Charango",
      "Quena",
      "Pincullo",
      "Siku",
      "Harp"
    ]
  },
  "services": {
    "section_title": "Services",
    "description": "I offer individual in-person lessons for students of all ages — from age 7 onwards — and all levels, both beginners and advanced. My approach is based on respecting each student's pace and process, without rushing stages, to achieve a wholesome and lasting musical development. Because we can all learn to make music.",
    "coverage": "In-person lessons in Apóstoles and Azara, Misiones.",
    "availability_title": "Availability",
    "days": "Tuesday to Friday",
    "hours_morning": "08:00 to 12:00",
    "hours_afternoon": "13:00 to 22:00"
  },
  "testimonials": {
    "section_title": "Testimonials",
    "items": [
      {
        "text": "I started from zero, knowing nothing about music, and Profe Pippo was incredibly patient with me. Today I can play my first songs on guitar and I can't believe how fast I learned.",
        "author": "Martina G.",
        "role": "Guitar student"
      },
      {
        "text": "My son is 8 years old and it's his first year of lessons. What surprised me most was how the teacher adapted to his pace without pressuring him. Now he looks forward to every class.",
        "author": "Rodrigo P.",
        "role": "Parent"
      },
      {
        "text": "I picked up the piano again after 20 years without touching it. I never felt judged for the time I'd been away. Profe Pippo knows exactly how to motivate you and take you to the next level.",
        "author": "Sandra M.",
        "role": "Piano student"
      },
      {
        "text": "I wanted to learn saxophone with no prior musical background. Within a few months I was already reading sheet music and playing my first pieces. An experience that exceeded all my expectations.",
        "author": "Carlos D.",
        "role": "Saxophone student"
      }
    ]
  },
  "form": {
    "section_title": "Contact",
    "label_name": "Full name",
    "label_age": "Student's age",
    "label_instrument": "Instrument of interest",
    "instrument_placeholder": "— Select an instrument —",
    "label_other_instrument": "Other instrument",
    "placeholder_other_instrument": "Specify the instrument",
    "label_phone": "Phone number",
    "label_email": "Email",
    "submit_default": "SEND INQUIRY",
    "submit_loading": "SENDING...",
    "error_name": "Please enter your full name.",
    "error_age": "Please enter an age between 7 and 100.",
    "error_instrument": "Please select an instrument from the list.",
    "error_other_instrument": "Please specify the instrument you are interested in.",
    "error_contact": "Please provide at least one contact method (phone or email).",
    "error_email_format": "Please enter a valid email address.",
    "privacy_note": "The data entered in this form is collected by Lucas Jonathan Didolich (Instituto Eufonía) for the sole purpose of responding to your inquiry and coordinating lessons. It will not be shared with third parties. You may request its correction or deletion at any time by writing to institutoeufonia@gmail.com."
  },
  "footer": {
    "name": "Profe Pippo",
    "copyright": "© 2026 Profe Pippo — Instituto de Aprendizaje Musical Eufonía. All rights reserved.",
    "instagram_label": "@instituto_musical_eufonia",
    "credits_text": "Built with love and mate 🧉. Would you like a website like this?",
    "credits_link_label": "Let's talk",
    "credits_link_url": "https://osvaldo-zakowicz.netlify.app/",
    "credits_author": "Copyright © 2026 Zakowicz Osvaldo Emanuel. All rights reserved."
  },
  "success_page": {
    "title": "Inquiry sent!",
    "body": "Thank you for your message. Profe Pippo will be in touch shortly.",
    "cta": "Back to home"
  },
  "error_page": {
    "title": "Something went wrong",
    "body": "We couldn't send your inquiry. Please try again or contact us on Instagram.",
    "cta": "Back to the form",
    "instagram_label": "@instituto_musical_eufonia"
  }
}
```

**Decisiones de traducción de instrumentos (documentadas):**

| Español                      | Inglés                    | Criterio                                                        |
| ---------------------------- | ------------------------- | --------------------------------------------------------------- |
| Piano                        | Piano                     | Denominación universal                                          |
| Guitarra                     | Guitar                    | Denominación establecida en inglés                              |
| Bajo                         | Bass                      | Denominación establecida en inglés                              |
| Batería                      | Drums                     | Denominación establecida en inglés                              |
| Flauta dulce                 | Recorder                  | Denominación establecida en inglés                              |
| Ukulele                      | Ukulele                   | Denominación universal de origen hawaiano                       |
| Clarinete                    | Clarinet                  | Denominación establecida en inglés                              |
| Saxofón                      | Saxophone                 | Denominación establecida en inglés                              |
| Acordeón diatónica a botones | Diatonic Button Accordion | Denominación técnica en inglés                                  |
| Acordeón a piano             | Piano Accordion           | Denominación técnica en inglés                                  |
| Violín                       | Violin                    | Denominación establecida en inglés                              |
| Viola                        | Viola                     | Denominación universal                                          |
| Violoncello                  | Cello                     | Denominación establecida en inglés                              |
| Contrabajo                   | Double Bass               | Denominación establecida en inglés                              |
| Armónica                     | Harmonica                 | Denominación establecida en inglés                              |
| Ocarina                      | Ocarina                   | Denominación universal                                          |
| Xilofón                      | Xylophone                 | Denominación establecida en inglés                              |
| Metalofón                    | Metallophone              | Denominación establecida en inglés                              |
| Marimba                      | Marimba                   | Denominación universal                                          |
| Bombo legüero                | Bombo Legüero             | Sin denominación establecida en inglés — se conserva en español |
| Cajón peruano                | Cajón Peruano             | Sin denominación establecida en inglés — se conserva en español |
| Tumbadoras                   | Tumbadoras                | Sin denominación establecida en inglés — se conserva en español |
| Bongó                        | Bongo                     | Denominación establecida en inglés                              |
| Charango                     | Charango                  | Sin denominación establecida en inglés — se conserva en español |
| Quena                        | Quena                     | Sin denominación establecida en inglés — se conserva en español |
| Pincullo                     | Pincullo                  | Sin denominación establecida en inglés — se conserva en español |
| Siku                         | Siku                      | Sin denominación establecida en inglés — se conserva en español |
| Arpa                         | Harp                      | Denominación establecida en inglés                              |

---

### 3.3 Estructura de datos del timeline

El agente genera los ítems del timeline a partir del array `trajectory.items` de `es.json`. La estructura de cada objeto es:

```javascript
/**
 * estructura de cada ítem del timeline
 * proviene de trajectory.items en es.json
 *
 * @property {string} period      - año o rango: "1992", "2001 — 2003", "Actualidad"
 * @property {string} title       - título corto del hito
 * @property {string} description - descripción del hito, puede contener comas y guiones
 *
 * ejemplo:
 * {
 *   period: "2012",
 *   title: "Inicio de la actividad docente",
 *   description: "Regreso a Misiones. Comienzo de la enseñanza musical en Azara..."
 * }
 */
```

El array tiene 10 ítems. El agente los renderiza en el orden en que aparecen en el JSON, de índice 0 (más antiguo) a índice 9 (más reciente). No se reordena en runtime.

---

### 3.4 Estructura de datos de testimonios

El agente genera los slides del carousel a partir del array `testimonials.items` de `es.json`. La estructura de cada objeto es:

```javascript
/**
 * estructura de cada testimonio
 * proviene de testimonials.items en es.json
 *
 * @property {string} text   - texto del testimonio, sin comillas externas (el html las agrega)
 * @property {string} author - nombre del autor: "Martina G."
 * @property {string} role   - rol del autor: "Alumna de Guitarra"
 *
 * ejemplo:
 * {
 *   text: "Empecé de cero, sin saber nada de música...",
 *   author: "Martina G.",
 *   role: "Alumna de Guitarra"
 * }
 */
```

El array tiene 4 ítems en v1. Swiper recibe los slides ya renderizados en el HTML; no los genera dinámicamente desde JS. El agente renderiza el HTML de cada slide dentro del contenedor `.swiper-wrapper` antes de inicializar Swiper.

---

### 3.5 Estructura de datos del formulario

Cada campo del formulario se define con la siguiente forma. Esta estructura sirve de referencia para `initForm()` en `main.js`.

```javascript
/**
 * estructura de cada campo del formulario
 * sirve de referencia para initForm() en main.js
 *
 * @property {string}   id            - id del input en el dom
 * @property {string}   type          - "text" | "number" | "select" | "tel" | "email"
 * @property {boolean}  required      - si es siempre requerido
 * @property {string}   [conditional] - id del campo del que depende (solo campo "otro")
 * @property {Function} validate      - recibe el valor como string; retorna mensaje de error o null si válido
 * @property {string}   errorId       - id del span donde se muestra el mensaje (aria-describedby)
 *
 * ejemplo:
 * {
 *   id: 'field-name',
 *   type: 'text',
 *   required: true,
 *   validate: (value) => value.trim() ? null : i18n.t('form.error_name'),
 *   errorId: 'error-name'
 * }
 */
```

| `id`                     | `type`   | `required` | `conditional`                       | Regla de validación                                                       |
| ------------------------ | -------- | ---------- | ----------------------------------- | ------------------------------------------------------------------------- |
| `field-name`             | `text`   | `true`     | —                                   | `.trim()` no vacío                                                        |
| `field-age`              | `number` | `true`     | —                                   | Entero, mín 7, máx 100                                                    |
| `field-instrument`       | `select` | `true`     | —                                   | Valor distinto de `""` (placeholder)                                      |
| `field-other-instrument` | `text`   | `false`    | `field-instrument` (valor `"otro"`) | `.trim()` no vacío cuando el padre es `"otro"`                            |
| `field-phone`            | `tel`    | `false`    | —                                   | No vacío tras `.trim()` si `field-email` está vacío                       |
| `field-email`            | `email`  | `false`    | —                                   | No vacío tras `.trim()` si `field-phone` está vacío; formato email válido |

---

## 4. Contratos de módulos JS

### 4.1 `i18n.js`

**Responsabilidad única:** cargar el archivo de localización activo y resolver todos los atributos `data-i18n` en el DOM. En v1 siempre carga `es.json`.

**API pública:**

```javascript
// i18n.js — api publica
export default {
  /**
   * carga el locale activo y actualiza el dom.
   * debe llamarse antes de initSwiper() y antes de cualquier
   * módulo que dependa de textos resueltos.
   * @returns {Promise<void>}
   */
  async init() {
    /* ... */
  },

  /**
   * retorna el valor de una clave del locale activo.
   * usa notación de punto para claves anidadas: "form.error_name"
   * retorna la clave entre corchetes si no existe: "[form.error_name]"
   * @param {string} key
   * @returns {string}
   */
  t(key) {
    /* ... */
  },

  /**
   * retorna el locale activo: "es" en v1, dinámico en v2.
   * @returns {string}
   */
  getLocale() {
    /* ... */
  },
};
```

**Comportamiento de resolución de `data-i18n`:**

1. `init()` hace `fetch('/locales/es.json')` y guarda el objeto en memoria.
2. Selecciona todos los elementos del DOM con `[data-i18n]`.
3. Para cada elemento, lee la clave del atributo y llama a `t(key)`.
4. Asigna el valor al `textContent` del elemento.
5. Actualiza `document.documentElement.lang` a `"es"`.
6. Actualiza `document.title` con `t('meta.title')`.
7. Actualiza `<meta name="description">` con `t('meta.description')`.

**No responsabilidad de `i18n.js`:** el módulo no construye HTML. Si un componente (timeline, testimonios) necesita generar nodos desde datos del locale, esa responsabilidad pertenece al módulo que inicializa ese componente en `main.js`, que llama a `i18n.t()` para obtener los valores.

---

### 4.2 `main.js`

**Responsabilidad:** orquestador de inicialización. Importa `i18n.js`, espera su resolución, y luego inicializa cada submódulo en el orden correcto. No contiene lógica de negocio: delega en funciones especializadas.

**Estructura interna (patrón Module, sin exports públicos):**

```javascript
// main.js — estructura interna
import i18n from './i18n.js';

// inicialización secuencial
async function main() {
  await i18n.init();
  initTimeline(); // genera los nodos del timeline desde i18n.t()
  initTestimonials(); // genera los slides y luego inicializa Swiper
  initNav(); // sidebar: clicks y estado activo inicial
  initHamburger(); // menú overlay mobile: toggle y cierre
  initIntersectionObserver(); // actualiza ítem activo al hacer scroll
  initForm(); // validación, campo condicional "otro", estado del botón
}

document.addEventListener('DOMContentLoaded', main);
```

**Submódulos y sus responsabilidades:**

| Función                      | Responsabilidad                                                                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `initTimeline()`             | Lee `trajectory.items` via `i18n`, genera el HTML de cada entrada del timeline e inserta los nodos en el contenedor `#timeline-list`.                                                |
| `initTestimonials()`         | Lee `testimonials.items` via `i18n`, genera el HTML de cada slide, los inserta en `.swiper-wrapper`, e inicializa la instancia de Swiper con la configuración definida en 4.3.       |
| `initNav()`                  | Escucha clicks en los ítems de nav (sidebar y overlay). Marca el ítem activo inicial si hay ancla en la URL. No gestiona scroll (delegado a CSS).                                    |
| `initHamburger()`            | Toggle del overlay mobile al hacer clic en el botón hamburguesa. Cierra el overlay al hacer clic fuera o al seleccionar un ítem.                                                     |
| `initIntersectionObserver()` | Observa cada `<section>` con `id`. Cuando una sección entra en el viewport, marca el ítem de nav correspondiente como activo. Umbral: `threshold: 0.4`.                              |
| `initForm()`                 | Muestra/oculta el campo libre "otro", valida todos los campos al intentar enviar, muestra mensajes de error asociados por `aria-describedby`, gestiona el estado del botón de envío. |

---

### 4.3 Configuración de Swiper

La instancia de Swiper se inicializa dentro de `initTestimonials()` con la siguiente configuración. No se modifica en ningún otro punto del código.

```javascript
// configuración de la instancia swiper (dentro de initTestimonials)
const swiper = new Swiper('.swiper', {
  loop: false,
  slidesPerView: 1, // mobile por defecto
  spaceBetween: 24,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  breakpoints: {
    1024: {
      slidesPerView: 2, // desktop: 2 cards visibles
    },
  },
  // las flechas se ocultan automáticamente cuando no hay slides suficientes
  // via la clase swiper-button-disabled que swiper agrega nativamente
  // si slidesPerView >= total de slides, swiper deshabilita los botones
  // se complementa con css: .swiper-button-disabled { display: none; }
});
```

---

### 4.4 Convenciones de eventos DOM

Los módulos se comunican únicamente a través del DOM. No se usa ningún bus de eventos global.

| Evento                             | Emisor    | Receptor                        | Propósito                                     |
| ---------------------------------- | --------- | ------------------------------- | --------------------------------------------- |
| `click` en `[data-nav-item]`       | usuario   | `initNav()` + `initHamburger()` | navegación por ancla y cierre del overlay     |
| `change` en `#field-instrument`    | usuario   | `initForm()`                    | mostrar/ocultar campo libre "otro"            |
| `submit` en `#contact-form`        | usuario   | `initForm()`                    | validar campos y liberar o bloquear el submit |
| `intersect` (IntersectionObserver) | navegador | `initIntersectionObserver()`    | actualizar ítem activo de nav                 |

No se usan `CustomEvent`, `EventEmitter`, ni ningún patrón de mensajería entre módulos. KISS.

---

## 5. Contratos de componentes HTML

### 5.1 Estructura global de `index.html`

```html
<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title data-i18n="meta.title"></title>
    <meta name="description" data-i18n="meta.description" />
    <meta property="og:title" data-i18n="meta.title" />
    <meta property="og:description" data-i18n="meta.description" />
    <meta property="og:image" content="/assets/img/profile.webp" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

    <!-- fuentes google fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500&display=swap"
      rel="stylesheet"
    />

    <!-- unicons -->
    <link
      rel="stylesheet"
      href="https://unicons.iconscout.com/release/v4.0.8/css/line.css"
    />

    <!-- swiper css -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
    />

    <!-- tailwind cdn -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- estilos custom -->
    <link rel="stylesheet" href="/assets/css/styles.css" />
  </head>
  <body class="bg-[var(--color-bg)] text-[var(--color-text)]">
    <!-- sidebar desktop -->
    <aside
      id="sidebar"
      class="hidden lg:flex fixed left-0 top-0 h-screen w-[var(--sidebar-width)] flex-col bg-[var(--color-surface)] border-r border-[var(--color-tertiary)]/30 z-40"
    >
      <!-- contenido del sidebar: ver 5.2 -->
    </aside>

    <!-- botón hamburguesa mobile -->
    <button
      id="hamburger-btn"
      aria-label="Abrir menú"
      aria-expanded="false"
      aria-controls="mobile-menu"
      class="lg:hidden fixed top-4 left-4 z-50 p-2 text-[var(--color-primary)]"
    >
      <i class="uil uil-bars text-2xl"></i>
    </button>

    <!-- overlay mobile -->
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
      class="lg:hidden fixed inset-0 z-40 bg-[var(--color-surface)] hidden flex-col items-center justify-center"
    >
      <!-- contenido del overlay: ver 5.3 -->
    </div>

    <!-- contenido principal -->
    <main id="main-content" class="lg:ml-[var(--sidebar-width)]">
      <section id="inicio"><!-- hero: ver 5.4 --></section>
      <section id="trayectoria"><!-- timeline: ver 5.5 --></section>
      <section id="instrumentos"><!-- grilla: ver 5.6 --></section>
      <section id="servicios"><!-- servicios: ver 5.7 --></section>
      <section id="testimonios"><!-- carousel: ver 5.8 --></section>
      <section id="contacto"><!-- formulario: ver 5.9 --></section>
    </main>

    <!-- footer -->
    <footer id="footer"><!-- ver 5.10 --></footer>

    <!-- swiper js (antes del módulo principal) -->
    <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>

    <!-- módulo principal -->
    <script type="module" src="/assets/js/main.js"></script>
  </body>
</html>
```

---

### 5.2 Sidebar (desktop)

```html
<aside
  id="sidebar"
  class="hidden lg:flex fixed left-0 top-0 h-screen w-[var(--sidebar-width)]
  flex-col bg-[var(--color-surface)] border-r border-[var(--color-tertiary)]/30 z-40 px-6 py-8"
>
  <!-- nombre artístico -->
  <p
    class="font-serif text-[var(--color-primary)] text-xl font-semibold mb-10 leading-tight"
    data-i18n="footer.name"
  ></p>

  <!-- ítems de navegación -->
  <nav aria-label="Navegación principal">
    <ul class="flex flex-col gap-1">
      <li>
        <a
          href="#inicio"
          data-nav-item="inicio"
          class="nav-link"
          data-i18n="nav.home"
        ></a>
      </li>
      <li>
        <a
          href="#trayectoria"
          data-nav-item="trayectoria"
          class="nav-link"
          data-i18n="nav.trajectory"
        ></a>
      </li>
      <li>
        <a
          href="#instrumentos"
          data-nav-item="instrumentos"
          class="nav-link"
          data-i18n="nav.instruments"
        ></a>
      </li>
      <li>
        <a
          href="#servicios"
          data-nav-item="servicios"
          class="nav-link"
          data-i18n="nav.services"
        ></a>
      </li>
      <li>
        <a
          href="#testimonios"
          data-nav-item="testimonios"
          class="nav-link"
          data-i18n="nav.testimonials"
        ></a>
      </li>
      <li>
        <a
          href="#contacto"
          data-nav-item="contacto"
          class="nav-link"
          data-i18n="nav.contact"
        ></a>
      </li>
    </ul>
  </nav>

  <!-- enlace instagram (al fondo del sidebar) -->
  <a
    href="https://www.instagram.com/instituto_musical_eufonia"
    target="_blank"
    rel="noopener noreferrer"
    class="mt-auto flex items-center gap-2 text-[var(--color-muted)] text-sm hover:text-[var(--color-primary)] transition-colors"
  >
    <i class="uil uil-instagram text-lg"></i>
    <span data-i18n="nav.instagram_label"></span>
  </a>
</aside>
```

**Clases utilitarias personalizadas (definidas en `styles.css`):**

```css
/* estilo base de ítem de navegación */
.nav-link {
  display: block;
  padding: 8px 16px;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--color-muted);
  border-radius: 4px;
  transition: color 0.15s ease;
}

.nav-link:hover,
.nav-link[aria-current='page'] {
  color: var(--color-primary);
}
```

El atributo `aria-current="page"` es gestionado por `initNav()` e `initIntersectionObserver()`. No se hardcodea en el HTML.

---

### 5.3 Overlay mobile

```html
<div
  id="mobile-menu"
  role="dialog"
  aria-modal="true"
  aria-label="Menú de navegación"
  class="lg:hidden fixed inset-0 z-40 bg-[var(--color-surface)] hidden flex-col items-center justify-center"
>
  <!-- botón cerrar -->
  <button
    id="close-menu-btn"
    aria-label="Cerrar menú"
    class="absolute top-4 right-4 p-2 text-[var(--color-primary)] text-2xl"
  >
    <i class="uil uil-times"></i>
  </button>

  <!-- ítems de navegación (misma lista que sidebar) -->
  <nav aria-label="Navegación mobile">
    <ul class="flex flex-col items-center gap-4 text-lg">
      <li>
        <a
          href="#inicio"
          data-nav-item="inicio"
          class="nav-link-mobile"
          data-i18n="nav.home"
        ></a>
      </li>
      <li>
        <a
          href="#trayectoria"
          data-nav-item="trayectoria"
          class="nav-link-mobile"
          data-i18n="nav.trajectory"
        ></a>
      </li>
      <li>
        <a
          href="#instrumentos"
          data-nav-item="instrumentos"
          class="nav-link-mobile"
          data-i18n="nav.instruments"
        ></a>
      </li>
      <li>
        <a
          href="#servicios"
          data-nav-item="servicios"
          class="nav-link-mobile"
          data-i18n="nav.services"
        ></a>
      </li>
      <li>
        <a
          href="#testimonios"
          data-nav-item="testimonios"
          class="nav-link-mobile"
          data-i18n="nav.testimonials"
        ></a>
      </li>
      <li>
        <a
          href="#contacto"
          data-nav-item="contacto"
          class="nav-link-mobile"
          data-i18n="nav.contact"
        ></a>
      </li>
    </ul>
  </nav>
</div>
```

`initHamburger()` gestiona `hidden` / `flex` en `#mobile-menu` y `aria-expanded` en `#hamburger-btn`.

---

### 5.4 Hero (`#inicio`)

```html
<section
  id="inicio"
  class="min-h-screen flex items-center px-6 lg:px-16 py-16
  bg-[var(--color-bg)]"
>
  <div
    class="max-w-[var(--content-max)] mx-auto w-full
    flex flex-col lg:flex-row items-center gap-10 lg:gap-16"
  >
    <!-- foto de perfil -->
    <div
      class="shrink-0 w-48 h-48 lg:w-64 lg:h-64 rounded-full overflow-hidden
      border-2 border-[var(--color-primary)]/40"
    >
      <picture>
        <source srcset="/assets/img/profile.webp" type="image/webp" />
        <img
          src="/assets/img/profile.jpg"
          alt="Foto de perfil de Lucas Jonathan Didolich, Profe Pippo"
          class="w-full h-full object-cover"
          width="256"
          height="256"
        />
      </picture>
    </div>

    <!-- texto -->
    <div class="text-center lg:text-left">
      <h1
        class="font-serif text-[var(--color-primary)] text-5xl lg:text-6xl font-bold leading-tight mb-3"
        data-i18n="hero.title"
      ></h1>
      <p
        class="text-[var(--color-muted)] text-lg mb-5"
        data-i18n="hero.subtitle"
      ></p>
      <p
        class="text-[var(--color-text)] text-base leading-relaxed mb-8 max-w-prose"
        data-i18n="hero.bio"
      ></p>
      <a
        href="#contacto"
        class="inline-block bg-[var(--color-primary)] text-[var(--color-bg)] font-sans font-medium
          text-sm tracking-wider px-6 py-3 rounded-lg hover:bg-[var(--color-secondary)] transition-colors"
        data-i18n="hero.cta"
      ></a>
    </div>
  </div>
</section>
```

---

### 5.5 Trayectoria (`#trayectoria`)

El contenedor vacío recibe los nodos generados por `initTimeline()` en runtime.

```html
<section id="trayectoria" class="py-16 px-6 lg:px-16 bg-[var(--color-surface)]">
  <div class="max-w-[var(--content-max)] mx-auto">
    <h2
      class="font-serif text-[var(--color-primary)] text-3xl font-bold mb-12"
      data-i18n="trajectory.section_title"
    ></h2>

    <!-- contenedor generado por initTimeline() -->
    <ol
      id="timeline-list"
      class="relative border-l border-[var(--color-primary)]/30 ml-4 flex flex-col gap-10"
      aria-label="Línea de tiempo de trayectoria"
    >
      <!-- los li son generados dinámicamente por initTimeline() -->
      <!-- estructura de cada li:
      <li class="relative pl-8">
        <span class="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-[var(--color-primary)]"></span>
        <time class="text-[var(--color-primary)] text-sm font-medium tracking-wider">
          {period}
        </time>
        <h3 class="text-[var(--color-text)] font-sans font-semibold text-base mt-1 mb-1">
          {title}
        </h3>
        <p class="text-[var(--color-muted)] text-sm leading-relaxed">
          {description}
        </p>
      </li>
      -->
    </ol>
  </div>
</section>
```

---

### 5.6 Instrumentos (`#instrumentos`)

La grilla de cards se renderiza estáticamente en el HTML. Los 28 instrumentos se escriben directamente en el marcado porque son contenido estático que no cambia en runtime y no requiere generación dinámica. Los textos de los nombres, al estar en `es.json`, entran mediante `data-i18n` con claves indexadas.

> **Decisión de implementación:** dado que los instrumentos son un array y no un mapa de claves nombradas, el agente puede elegir entre dos enfoques: (a) renderizar las 28 cards estáticamente en el HTML con `data-i18n="instruments.items.0"` … `data-i18n="instruments.items.27"`, o (b) generar las cards dinámicamente desde JS, como hace `initTimeline()`. Se prefiere el enfoque (a) para esta sección porque el contenido es puramente estático y el enfoque (b) agrega complejidad sin beneficio en v1. El agente usa el enfoque que mejor cumpla esta restricción.

```html
<section id="instrumentos" class="py-16 px-6 lg:px-16 bg-[var(--color-bg)]">
  <div class="max-w-[var(--content-max)] mx-auto">
    <h2
      class="font-serif text-[var(--color-primary)] text-3xl font-bold mb-10"
      data-i18n="instruments.section_title"
    ></h2>

    <!-- grilla: 2 cols mobile, 4 cols desktop -->
    <ul
      class="grid grid-cols-2 lg:grid-cols-4 gap-4"
      aria-label="Instrumentos que se enseñan"
    >
      <!-- estructura de cada li:
      <li class="bg-[var(--color-surface)] rounded-lg p-4
        border-l-[3px] border-[var(--color-primary)]
        flex items-center justify-center text-center
        font-sans font-medium text-sm tracking-wider text-[var(--color-text)]">
        {nombre del instrumento}
      </li>
      -->
      <!-- 28 ítems, en el orden de es.json -->
    </ul>
  </div>
</section>
```

---

### 5.7 Servicios y disponibilidad (`#servicios`)

```html
<section id="servicios" class="py-16 px-6 lg:px-16 bg-[var(--color-surface)]">
  <div class="max-w-[var(--content-max)] mx-auto">
    <h2
      class="font-serif text-[var(--color-primary)] text-3xl font-bold mb-10"
      data-i18n="services.section_title"
    ></h2>

    <!-- dos columnas desktop, apilado mobile -->
    <div class="flex flex-col lg:flex-row gap-10 lg:gap-16">
      <!-- bloque descripción -->
      <div class="flex-1">
        <p
          class="text-[var(--color-text)] text-base leading-relaxed mb-4"
          data-i18n="services.description"
        ></p>
        <p
          class="text-[var(--color-muted)] text-sm"
          data-i18n="services.coverage"
        ></p>
      </div>

      <!-- bloque disponibilidad -->
      <div class="shrink-0 lg:w-64 bg-[var(--color-bg)] rounded-lg p-6">
        <div class="flex items-center gap-2 mb-4">
          <i class="uil uil-clock text-[var(--color-primary)] text-xl"></i>
          <h3
            class="font-serif text-[var(--color-text)] text-xl font-semibold"
            data-i18n="services.availability_title"
          ></h3>
        </div>
        <p
          class="text-[var(--color-primary)] text-sm font-medium tracking-wider mb-3"
          data-i18n="services.days"
        ></p>
        <p
          class="text-[var(--color-text)] text-base"
          data-i18n="services.hours_morning"
        ></p>
        <p
          class="text-[var(--color-text)] text-base"
          data-i18n="services.hours_afternoon"
        ></p>
      </div>
    </div>
  </div>
</section>
```

---

### 5.8 Testimonios (`#testimonios`)

Los slides son generados por `initTestimonials()` antes de que Swiper se inicialice.

```html
<section id="testimonios" class="py-16 px-6 lg:px-16 bg-[var(--color-bg)]">
  <div class="max-w-[var(--content-max)] mx-auto">
    <h2
      class="font-serif text-[var(--color-primary)] text-3xl font-bold mb-10"
      data-i18n="testimonials.section_title"
    ></h2>

    <!-- contenedor swiper -->
    <div class="swiper relative">
      <div class="swiper-wrapper">
        <!-- slides generados por initTestimonials():
        <div class="swiper-slide">
          <article class="bg-[var(--color-surface)] rounded-lg p-6 h-full flex flex-col gap-4">
            <p class="text-[var(--color-text)] text-base leading-relaxed before:content-['"'] after:content-['"']">
              {text}
            </p>
            <footer class="mt-auto">
              <p class="text-[var(--color-primary)] text-sm font-medium">{author}</p>
              <p class="text-[var(--color-muted)] text-xs">{role}</p>
            </footer>
          </article>
        </div>
        -->
      </div>

      <!-- flechas de navegación -->
      <button
        class="swiper-button-prev"
        aria-label="Testimonio anterior"
      ></button>
      <button
        class="swiper-button-next"
        aria-label="Testimonio siguiente"
      ></button>
    </div>
  </div>
</section>
```

**CSS adicional para Swiper en `styles.css`:**

```css
/* oculta las flechas cuando están deshabilitadas */
.swiper-button-disabled {
  display: none !important;
}

/* ajuste de color de las flechas de swiper al sistema de diseño */
.swiper-button-prev,
.swiper-button-next {
  color: var(--color-primary);
}
```

---

### 5.9 Formulario de contacto (`#contacto`)

```html
<section id="contacto" class="py-16 px-6 lg:px-16 bg-[var(--color-surface)]">
  <div class="max-w-[var(--content-max)] mx-auto">
    <h2
      class="font-serif text-[var(--color-primary)] text-3xl font-bold mb-10"
      data-i18n="form.section_title"
    ></h2>

    <!-- contenedor de ancho limitado centrado -->
    <div class="max-w-[var(--form-max)] mx-auto">
      <form
        id="contact-form"
        name="contacto"
        method="POST"
        action="/exito.html"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        novalidate
      >
        <!-- campo honeypot oculto para netlify -->
        <p class="hidden" aria-hidden="true">
          <label
            >No completar:
            <input name="bot-field" tabindex="-1" autocomplete="off"
          /></label>
        </p>

        <!-- campo: nombre -->
        <div class="form-group mb-5">
          <label
            for="field-name"
            class="form-label"
            data-i18n="form.label_name"
          ></label>
          <input
            id="field-name"
            name="nombre"
            type="text"
            class="form-input w-full"
            aria-describedby="error-name"
            autocomplete="name"
          />
          <span
            id="error-name"
            class="form-error"
            role="alert"
            aria-live="polite"
          ></span>
        </div>

        <!-- campo: edad -->
        <div class="form-group mb-5">
          <label
            for="field-age"
            class="form-label"
            data-i18n="form.label_age"
          ></label>
          <input
            id="field-age"
            name="edad"
            type="number"
            min="7"
            max="100"
            step="1"
            class="form-input w-full"
            aria-describedby="error-age"
          />
          <span
            id="error-age"
            class="form-error"
            role="alert"
            aria-live="polite"
          ></span>
        </div>

        <!-- campo: instrumento -->
        <div class="form-group mb-5">
          <label
            for="field-instrument"
            class="form-label"
            data-i18n="form.label_instrument"
          ></label>
          <select
            id="field-instrument"
            name="instrumento"
            class="form-input w-full"
            aria-describedby="error-instrument"
          >
            <option
              value=""
              disabled
              selected
              data-i18n="form.instrument_placeholder"
            ></option>
            <!-- las 28 opciones de instrumentos en orden de es.json -->
            <option value="Piano">Piano</option>
            <option value="Guitarra">Guitarra</option>
            <option value="Bajo">Bajo</option>
            <option value="Batería">Batería</option>
            <option value="Flauta dulce">Flauta dulce</option>
            <option value="Ukulele">Ukulele</option>
            <option value="Clarinete">Clarinete</option>
            <option value="Saxofón">Saxofón</option>
            <option value="Acordeón diatónica a botones">
              Acordeón diatónica a botones
            </option>
            <option value="Acordeón a piano">Acordeón a piano</option>
            <option value="Violín">Violín</option>
            <option value="Viola">Viola</option>
            <option value="Violoncello">Violoncello</option>
            <option value="Contrabajo">Contrabajo</option>
            <option value="Armónica">Armónica</option>
            <option value="Ocarina">Ocarina</option>
            <option value="Xilofón">Xilofón</option>
            <option value="Metalofón">Metalofón</option>
            <option value="Marimba">Marimba</option>
            <option value="Bombo legüero">Bombo legüero</option>
            <option value="Cajón peruano">Cajón peruano</option>
            <option value="Tumbadoras">Tumbadoras</option>
            <option value="Bongó">Bongó</option>
            <option value="Charango">Charango</option>
            <option value="Quena">Quena</option>
            <option value="Pincullo">Pincullo</option>
            <option value="Siku">Siku</option>
            <option value="Arpa">Arpa</option>
            <option value="otro">Otro instrumento...</option>
          </select>
          <span
            id="error-instrument"
            class="form-error"
            role="alert"
            aria-live="polite"
          ></span>
        </div>

        <!-- campo condicional: otro instrumento (oculto por defecto) -->
        <div id="other-instrument-group" class="form-group mb-5 hidden">
          <label
            for="field-other-instrument"
            class="form-label"
            data-i18n="form.label_other_instrument"
          ></label>
          <input
            id="field-other-instrument"
            name="otro_instrumento"
            type="text"
            class="form-input w-full"
            aria-describedby="error-other-instrument"
            data-i18n-placeholder="form.placeholder_other_instrument"
          />
          <span
            id="error-other-instrument"
            class="form-error"
            role="alert"
            aria-live="polite"
          ></span>
        </div>

        <!-- campo: teléfono -->
        <div class="form-group mb-5">
          <label
            for="field-phone"
            class="form-label"
            data-i18n="form.label_phone"
          ></label>
          <input
            id="field-phone"
            name="telefono"
            type="tel"
            class="form-input w-full"
            aria-describedby="error-contact"
            autocomplete="tel"
          />
          <!-- el span de error de contacto se comparte con email -->
        </div>

        <!-- campo: email -->
        <div class="form-group mb-5">
          <label
            for="field-email"
            class="form-label"
            data-i18n="form.label_email"
          ></label>
          <input
            id="field-email"
            name="email"
            type="email"
            class="form-input w-full"
            aria-describedby="error-contact error-email-format"
            autocomplete="email"
          />
          <span
            id="error-contact"
            class="form-error"
            role="alert"
            aria-live="polite"
          ></span>
          <span
            id="error-email-format"
            class="form-error"
            role="alert"
            aria-live="polite"
          ></span>
        </div>

        <!-- aviso de privacidad -->
        <p
          class="text-[var(--color-muted)] text-xs leading-relaxed mb-6"
          data-i18n="form.privacy_note"
        ></p>

        <!-- botón de envío -->
        <button
          id="submit-btn"
          type="submit"
          class="w-full bg-[var(--color-primary)] text-[var(--color-bg)]
            font-sans font-medium text-sm tracking-wider py-3 px-6 rounded-lg
            hover:bg-[var(--color-secondary)] transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-primary)]"
        >
          <span id="submit-label" data-i18n="form.submit_default"></span>
        </button>
      </form>
    </div>
  </div>
</section>
```

**Clases utilitarias de formulario definidas en `styles.css`:**

```css
.form-label {
  display: block;
  margin-bottom: 6px;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.form-input {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  transition: border-color 0.15s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-error {
  display: block;
  margin-top: 4px;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  color: var(--color-tertiary);
  min-height: 1em; /* reserva espacio para evitar reflow al aparecer el error */
}
```

---

### 5.10 Footer

```html
<footer
  id="footer"
  class="border-t border-[var(--color-tertiary)]/40 py-8 px-6 lg:px-16
  bg-[var(--color-bg)]"
>
  <div
    class="max-w-[var(--content-max)] mx-auto
    flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left"
  >
    <!-- nombre artístico -->
    <p
      class="font-sans text-[var(--color-primary)] text-sm font-medium tracking-wider"
      data-i18n="footer.name"
    ></p>

    <!-- links de navegación -->
    <nav aria-label="Navegación del footer">
      <ul class="flex flex-wrap justify-center gap-4">
        <li><a href="#inicio" class="footer-link" data-i18n="nav.home"></a></li>
        <li>
          <a
            href="#trayectoria"
            class="footer-link"
            data-i18n="nav.trajectory"
          ></a>
        </li>
        <li>
          <a
            href="#instrumentos"
            class="footer-link"
            data-i18n="nav.instruments"
          ></a>
        </li>
        <li>
          <a href="#servicios" class="footer-link" data-i18n="nav.services"></a>
        </li>
        <li>
          <a
            href="#testimonios"
            class="footer-link"
            data-i18n="nav.testimonials"
          ></a>
        </li>
        <li>
          <a href="#contacto" class="footer-link" data-i18n="nav.contact"></a>
        </li>
      </ul>
    </nav>

    <!-- instagram -->
    <a
      href="https://www.instagram.com/instituto_musical_eufonia"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-1 text-[var(--color-muted)] text-sm hover:text-[var(--color-primary)] transition-colors"
    >
      <i class="uil uil-instagram"></i>
      <span data-i18n="footer.instagram_label"></span>
    </a>

    <!-- copyright del sitio -->
    <p
      class="text-[var(--color-muted)] text-xs"
      data-i18n="footer.copyright"
    ></p>

    <!-- créditos del desarrollador -->
    <p class="text-[var(--color-muted)] text-xs">
      <span data-i18n="footer.credits_text"></span>
      <a
        href="https://osvaldo-zakowicz.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
        class="text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors ml-1"
        data-i18n="footer.credits_link_label"
      ></a>
    </p>

    <!-- copyright del desarrollador -->
    <p
      class="text-[var(--color-muted)] text-xs"
      data-i18n="footer.credits_author"
    ></p>
  </div>
</footer>
```

```css
/* styles.css */
.footer-link {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--color-muted);
  transition: color 0.15s ease;
}

.footer-link:hover {
  color: var(--color-primary);
}
```

---

### 5.11 `exito.html` y `error.html`

Ambas páginas comparten la misma estructura base. Solo cambian el icono, el color del icono, y los textos.

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title data-i18n="success_page.title"><!-- o error_page.title --></title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <!-- fuentes, unicons, tailwind, styles.css (mismos que index.html) -->
  </head>
  <body
    class="bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen flex items-center justify-center p-6"
  >
    <div
      class="bg-[var(--color-surface)] rounded-lg p-10 max-w-md w-full text-center"
    >
      <!-- icono: success = uil-check-circle color primary | error = uil-exclamation-circle color tertiary -->
      <i
        class="uil uil-check-circle text-5xl text-[var(--color-primary)] mb-4"
      ></i>

      <h1
        class="font-serif text-[var(--color-text)] text-2xl font-semibold mb-3"
        data-i18n="success_page.title"
      ></h1>
      <p
        class="text-[var(--color-muted)] text-base mb-8"
        data-i18n="success_page.body"
      ></p>

      <!-- solo en error.html: enlace instagram -->
      <!-- <a href="https://www.instagram.com/instituto_musical_eufonia" ...></a> -->

      <a
        href="/index.html"
        class="inline-block bg-[var(--color-primary)] text-[var(--color-bg)]
        font-sans font-medium text-sm tracking-wider px-6 py-3 rounded-lg
        hover:bg-[var(--color-secondary)] transition-colors"
        data-i18n="success_page.cta"
      ></a>
    </div>

    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="/assets/css/styles.css" />
    <script type="module" src="/assets/js/i18n.js"></script>
  </body>
</html>
```

---

## 6. Configuración de Netlify

### 6.1 `netlify.toml`

```toml
# netlify.toml

[build]
  publish = "."

# headers de seguridad para todas las páginas
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

# headers de cache para assets estáticos
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/locales/*"
  [headers.values]
    Cache-Control = "public, max-age=86400"
```

**Nota:** no se definen redirects manuales para `exito.html` y `error.html` porque Netlify Forms usa el atributo `action` del formulario para el redirect de éxito. El redirect de error es manejado por Netlify automáticamente cuando se configura `data-netlify-error-page` o se deja el comportamiento por defecto. En v1 se usa el comportamiento por defecto de Netlify para errores de red.

### 6.2 Configuración del formulario en el HTML

Los atributos requeridos por Netlify Forms en el elemento `<form>` son:

| Atributo                | Valor           | Descripción                                         |
| ----------------------- | --------------- | --------------------------------------------------- |
| `name`                  | `"contacto"`    | Identificador del formulario en el panel de Netlify |
| `method`                | `"POST"`        | Método HTTP requerido por Netlify Forms             |
| `action`                | `"/exito.html"` | Redirección tras envío exitoso                      |
| `data-netlify`          | `"true"`        | Activa el procesamiento de Netlify Forms            |
| `data-netlify-honeypot` | `"bot-field"`   | Campo honeypot para mitigación de spam              |

El email de destino (`institutoeufonia@gmail.com`) se configura en el panel de Netlify bajo **Forms → Notifications**, no en el código. No hay ningún valor de email en el repositorio.

---

## 7. Configuración de CI (GitHub Actions)

### 7.1 Pipeline completo

```yaml
# .github/workflows/ci.yml

name: CI

on:
  pull_request:
    branches:
      - main

jobs:
  validate-html:
    name: validate-html
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g html-validate
      - run: html-validate "*.html"

  validate-css:
    name: validate-css
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g stylelint stylelint-config-standard
      - run: stylelint "assets/css/**/*.css"

  validate-js:
    name: validate-js
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g eslint
      - run: eslint "assets/js/**/*.js"
```

### 7.2 Configuración de herramientas

**`.html-validate.json`** (en la raíz del repositorio):

```json
{
  "extends": ["html-validate:recommended"],
  "rules": {
    "no-trailing-whitespace": "off"
  }
}
```

**`.stylelintrc.json`** (en la raíz del repositorio):

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "selector-class-pattern": null,
    "custom-property-empty-line-before": "never"
  }
}
```

**`.eslintrc.json`** (en la raíz del repositorio):

```json
{
  "env": {
    "browser": true,
    "es2022": true
  },
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {
    "no-var": "error",
    "prefer-const": "error",
    "no-eval": "error",
    "no-unused-vars": "warn"
  }
}
```

---

## 8. Checklist de cierre de Fase 4

- [x] Árbol de archivos definitivo documentado con responsabilidades
- [x] Capas del sistema definidas con reglas de dependencia
- [x] Flujo de inicialización de la página documentado en orden
- [x] Estrategia de estilos (Tailwind CDN + variables CSS) documentada
- [x] `locales/es.json` completo con todos los valores reales
- [x] `locales/en.json` con estructura de claves y valores traducidos listos para v2
- [x] Tipos de datos de timeline, testimonios y formulario documentados en JS con JSDoc
- [x] API pública de `i18n.js` documentada con firmas
- [x] Responsabilidades de `main.js` y sus submódulos documentadas
- [x] Configuración de Swiper documentada
- [x] Convenciones de eventos DOM documentadas
- [x] Esqueletos HTML de todas las secciones documentados con clases Tailwind
- [x] Clases utilitarias CSS custom documentadas con sus estilos
- [x] `netlify.toml` con headers de seguridad y cache definidos
- [x] Configuración de atributos de Netlify Forms documentada
- [x] Pipeline de CI con los tres jobs documentado
- [x] Configuraciones de `html-validate`, `stylelint` y `eslint` documentadas
- [x] Todos los artefactos de Fase 4 producidos y revisados por Osvaldo

**Fase 4 cerrada cuando Osvaldo aprueba este documento → Fase 5: Checkpoint humano obligatorio**

---

_Fin del documento — Fase 4 v1.1_
