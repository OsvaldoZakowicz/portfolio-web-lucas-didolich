# AGENTS.md

## 1. Purpose

This document is the ONLY source of truth for AI agents working in this repository. The original technical spec is NOT available at runtime. Priorities: spec compliance, predictability, maintainability, accessibility, responsive behavior, low complexity, clean code, KISS, DRY.

## 2. Operational Rules

Agent ALWAYS works on branch `develop`. Allowed git command:

```bash
git branch --show-current
```

Forbidden git commands: add, commit, push, pull, fetch, merge, rebase, checkout, switch, stash, tag, reset, restore, revert, cherry-pick, branch. If current branch is not `develop`, stop work and report issue. Never attempt branch changes. Agent modifies ONLY files required for the task. Never refactor unrelated code, rename files without spec justification, introduce speculative abstractions, optimize prematurely, add dependencies without explicit approval.

## 3. Stack

- Allowed: HTML5, CSS3, JavaScript ES6 modules, Tailwind CDN, Swiper CDN, Unicons CDN.
- Forbidden: Node.js tooling, npm, pnpm, yarn, webpack, vite, parcel, babel, TypeScript, React, Vue, Angular, Svelte, JSX, TSX, state managers, CSS-in-JS.
- Project must remain fully deployable as static files.

## 4. Protected Files

Protected files must NEVER be rewritten entirely unless task explicitly requires it.

Protected files:

- AGENTS.md
- DESIGN.md
- /locales/es.json
- /locales/en.json
- /assets/css/styles.css
- /netlify.toml
- /.github/workflows/ci.yml
- /docs/fase-4-spec-tecnica.md

Prefer minimal diffs.
Do not rewrite entire files for localized changes.
Preserve formatting, architecture and existing structure.

Read-only reference files:

- `/docs/fase-4-spec-tecnica.md` is available as a read-only technical reference.
- Agent MAY read this file to extract HTML contracts, data schemas, module interfaces and Netlify configuration details.
- Agent MUST NOT edit, rewrite, reorder or modify this file under any circumstance.

## 5. Repository Structure

Required minimal structure:

```text
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
│   └── tasklist.md             ← roadmap incremental de implementación
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

Forbidden: src, dist, build, tooling, config, package manifests.

## 6. Locale Rules

- `/locales/es.json` already exists and is immutable.
- Agent may read and use it.
- Agent must NEVER edit, rewrite, reorder, rename keys, normalize or reformat `es.json`.
- All UI text must originate from locale files unless explicitly defined otherwise.
- `i18n.js` is the ONLY localization authority.
- Responsibilities: fetch locale, resolve `data-i18n`, expose translation API, update metadata.
- Forbidden inside `i18n.js`: HTML generation, component rendering.

### HTML Localization Contract

All user-visible text must be resolved through localization attributes.

HTML must use localization hooks such as:

```html
<h2 data-i18n="services.title"></h2>
<p data-i18n="hero.description"></p>
```

Rules:

- User-visible text MUST NOT be hardcoded in HTML unless explicitly allowed by spec.
- `data-i18n` attributes are mandatory for localized text nodes.
- HTML defines structure and localization hooks only.
- `i18n.js` is the ONLY authority allowed to inject localized text into the DOM.
- `i18n.js` must resolve all matching `[data-i18n]` elements after locale load.
- Missing localization keys must fail safely using defensive handling and `console.error`.
- Localization resolution must use deterministic key lookup only.
- Forbidden:
  - duplicated translation sources
  - hardcoded UI copy
  - inline translation maps
  - HTML generation inside `i18n.js`
  - mixing translated and hardcoded text for the same UI element

Localized attributes may use dedicated hooks:

```html
<input data-i18n-placeholder="form.email.placeholder" />
<button data-i18n-aria-label="nav.openMenu"></button>
```

`i18n.js` is responsible for resolving these attributes into their corresponding DOM properties.

## 7. Required CDNs

Tailwind:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

Swiper CSS:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
/>
```

Swiper JS:

```html
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
```

Unicons:

```html
<link
  rel="stylesheet"
  href="https://unicons.iconscout.com/release/v4.0.8/css/line.css"
/>
```

Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

No other external libraries allowed.

## 8. Architecture

- Create new JS modules ONLY when responsibility is clearly isolated, reused behavior exists, file size becomes problematic or spec explicitly requires separation.
- Prefer progressive enhancement.
- Do not replace large DOM sections unnecessarily.
- Avoid `innerHTML` when deterministic DOM APIs are sufficient.
- Architecture principles: modular, deterministic, explicit, DOM-driven, low abstraction.
- No hidden coupling, implicit global state, framework simulation, reactive systems, event bus, pub/sub.
- Modules communicate ONLY through native DOM state and browser events.
- Prefer simple loops, direct DOM APIs, explicit conditions, small functions, readable selectors.
- Avoid metaprogramming, inheritance, unnecessary factories, over-abstraction.
- Two repetitions do not justify abstraction.
- Hierarchy: AGENTS.md > existing architecture > agent preference.
- If ambiguity exists, choose simplest implementation.

## 9. HTML Rules

- Semantic-first HTML required: header, nav, main, section, article, aside, footer, form, label, button, ul, ol, li.
- Avoid unnecessary div nesting.
- Accessibility mandatory.
- Required attributes where applicable: aria-label, aria-current, aria-describedby, aria-expanded, aria-modal, alt, role.
- Maintain logical heading hierarchy.

## 10. CSS Rules

- Tailwind is utility-first.
- Custom CSS allowed only for reusable semantic classes, design tokens, Swiper adjustments, impossible/unreasonable utility cases.
- Forbidden: inline styles, JS-generated styling, deep selector nesting, excessive `!important`, visual hacks.
- No shadows, gradients, glassmorphism, neumorphism.
- No animations, parallax, fade-ins, transforms, motion effects.
- Depth is created ONLY through tonal contrast.

## 11. JavaScript Rules

- JavaScript style: modular, imperative, framework-free.
- Use `const` by default, `let` only when required.
- Prefer early returns and pure helpers.
- Avoid classes unless truly necessary, hidden state, magic numbers, mutation-heavy logic, large functions.
- Functions should do one thing and avoid deep nesting.
- Comments explain WHY, not obvious behavior.

## 12. main.js Contract

- `main.js` is ONLY an orchestrator.
- Responsibilities: wait for DOMContentLoaded, initialize modules sequentially, preserve initialization order.
- Forbidden inside `main.js`: business logic, validation rules, HTML generation details, localization logic.
- Required initialization order:

```js
await i18n.init();
initTimeline();
initTestimonials();
initNav();
initHamburger();
initIntersectionObserver();
initForm();
```

## 13. Site Structure

- Single-page anchor-based website.
- Mandatory sections in exact order:

1. `#inicio`
2. `#trayectoria`
3. `#instrumentos`
4. `#servicios`
5. `#testimonios`
6. `#contacto`
7. `#footer`

- Services section is mandatory.
- Timeline and Testimonials are dynamically rendered from locale data.
- Instruments may remain static.

## 14. Swiper Rules

- Swiper initializes ONLY inside `initTestimonials()` and ONLY after slides exist in DOM.
- Forbidden: alternative carousel libraries, custom slider systems, dynamic reconfiguration.
  Configuration:

```js
new Swiper('.swiper', {
  loop: false,
  slidesPerView: 1,
  spaceBetween: 24,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  breakpoints: {
    1024: {
      slidesPerView: 2,
    },
  },
});
```

Desktop maximum: 2 visible slides. Never 3.
Required CSS:

```css
.swiper-button-disabled {
  display: none !important;
}
```

## 15. Design Tokens

Required tokens:

```css
:root {
  --color-bg: #17181d;
  --color-surface: #1f2029;
  --color-primary: #e09f3e;
  --color-secondary: #ee964b;
  --color-tertiary: #9e2a2b;
  --color-text: #ffffff;
  --color-muted: rgba(255, 255, 255, 0.75);
  --bg-alt-1: #540b0e;
  --bg-alt-2: #583101;
  --bg-alt-3: #603808;
  --bg-alt-4: #6f4518;
  --sidebar-width: 240px;
  --content-max: 960px;
  --form-max: 600px;
}
```

Forbidden: blue, green, purple accents, arbitrary semantic colors.

## 16. Typography

Allowed fonts only:

- Playfair Display: headings, artistic name.
- Inter: body, labels, forms, navigation, UI.
  Never introduce additional font families.
  Never use Playfair for body text.

## 17. Responsive Rules

- Mobile-first.
- Desktop breakpoint: `lg` / `1024px`.
- Desktop: fixed left sidebar, 240px width.
- Mobile: hamburger + fullscreen overlay.
- Instruments grid: 2 cols mobile, 4 cols desktop.
- Testimonials: 1 slide mobile, 2 slides desktop.
- Never break spec-defined layouts.

## 18. Form Rules

Exact fields only:

1. Name
2. Age
3. Instrument
4. Phone
5. Email
   Forbidden: textarea, message field, additional fields.
   Conditional field `field-other-instrument` appears only when instrument value is `otro`.
   Validation rules:

- name: non-empty trim
- age: integer 7-100
- instrument: non-empty
- other instrument: required only when parent is `otro`
- phone: required if email empty
- email: required if phone empty and must be valid format
  Error messages use `aria-describedby`, `role="alert"`, `aria-live="polite"`.

Netlify Forms required attributes on `<form>`:

- `name="contacto"`
- `method="POST"`
- `action="/exito.html"`
- `data-netlify="true"`
- `data-netlify-honeypot="bot-field"`
- `data-netlify-error="/error.html"`

## 19. Accessibility

- WCAG AA contrast mandatory.
- Required: keyboard accessibility, visible focus states, semantic structure, descriptive labels, accessible validation.
- Never remove focus outlines without replacement.

## 20. Performance

- Prioritize low-end mobile devices and slow connections.
- Prefer static markup, simple DOM operations, low JS complexity.
- Avoid excessive listeners, unnecessary queries, layout thrashing, oversized assets.
- Images must define dimensions and avoid layout shifts.

## 21. Forbidden Patterns

- Forbidden: inline event handlers, jQuery, runtime templating libraries, animation libraries, hidden magic behavior, mutation-heavy shared state, speculative abstractions, unnecessary async logic.

## 22. Error Handling

- Use defensive checks for missing DOM nodes, failed fetches, invalid locale keys.
- Prefer `console.error()` over silent failure.
- Avoid noisy logging.

## 23. Netlify Deployment

- Hosting target: Netlify static hosting.
- Project must deploy without build step.
- Required file:

Required configuration:

```toml
[build]
  publish = "."
```

Form redirect behavior:

- Success redirect is handled natively by Netlify Forms via the `action` attribute on `<form>`.
- Error redirect requires `data-netlify-error="/error.html"` on the `<form>` element.
- No `[[redirects]]` block is needed or allowed for this project.
- Never add a SPA-style catch-all redirect (`from = "/*"`). This project has independent HTML pages and no JS router.

Forbidden: SSR, edge functions, server runtimes, build commands, environment-dependent rendering.

## 24. GitHub Structure

Required repository structure:

```text
/.github
└── /workflows
    └── ci.yml
```

Agent may create or modify ONLY:

```text
/.github/workflows/ci.yml
```

- No additional workflows allowed.
- Forbidden: release workflows, deploy workflows, Docker workflows, matrix builds, automated versioning, package publishing.

## 25. CI Expectations

CI uses GitHub Actions and Node.js 20. Purpose: static validation only. Allowed tooling: html-validate, stylelint, eslint. Forbidden: bundlers, transpilers, compilation, artifact generation. Required CI behavior:

- run on pull requests to `main`
- use ubuntu-latest
- use Node.js 20
- validate HTML
- validate CSS
- validate JavaScript
- fail on lint errors Required workflow with 3 jobs:

```yml
name: CI
on:
  pull_request:
    branches: [main]

jobs:
  html-validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g html-validate
      - run: html-validate "**/*.html"

  stylelint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g stylelint stylelint-config-standard
      - run: stylelint "assets/css/**/*.css"

  eslint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g eslint
      - run: eslint "assets/js/**/*.js"
```

Repository must remain CI-friendly without build tooling. Expected validation targets: valid HTML, no runtime JS errors, accessible semantics, deterministic structure, no broken imports. No transpilation, compilation or environment variables. Repository must remain CI-friendly without build tooling. Expected validation targets: valid HTML, no runtime JS errors, accessible semantics, deterministic structure, no broken imports. No transpilation, compilation or environment variables.

## 26. Definition of Done

Task is done when: spec compliance preserved, accessibility preserved, responsive behavior works, no forbidden patterns introduced, no unnecessary dependencies added, localization rules respected, console errors absent, architecture coherent, code readable.

## 27. Agent Checklist

Before work: read relevant section, verify `develop` branch, identify affected files, avoid unrelated modifications.
Before finalizing: validate responsiveness, accessibility, initialization order, forbidden dependencies, console errors, absence of git operations.

## 28. Final Principle

- Goal is not maximum sophistication.
- Goal is a stable, maintainable, predictable, spec-compliant, human-readable frontend.
- Prefer simple code over clever code.

## 29. Task List Execution Policy

The repository may contain a global task list document describing the full implementation roadmap.

Default location:

```text
/docs/tasklist.md
```

Rules:

- Agent MAY read the entire task list for architectural awareness and dependency understanding.
- Agent MUST execute ONLY the task explicitly assigned by the developer.
- Agent MUST NOT self-assign future tasks.
- Agent MUST NOT continue automatically to the next task after finishing current work.
- Agent MUST NOT partially implement future tasks unless explicitly required by the current task.
- Agent MUST NOT modify task statuses, checkboxes, progress markers or roadmap structure unless explicitly instructed.
- Agent MUST preserve repository stability after every completed task.

Mandatory invariant after every task:

- HTML remains valid
- CSS remains valid
- JavaScript remains parseable
- Imports remain resolvable
- CI must remain passable
- No broken runtime caused by partial implementation

If a task cannot be completed without breaking these invariants, agent must stop and report the issue instead of introducing unstable intermediate states.

Task execution model:

- global roadmap awareness
- local isolated execution
- deterministic incremental delivery
- minimal diffs
- no speculative implementation

## 30. Design Authority

The repository may contain a design specification document:

```text
/docs/DESIGN.md
```

`DESIGN.md` is the authoritative source for:

- visual hierarchy
- spacing
- layout behavior
- color usage
- typography usage
- component appearance
- responsive composition
- visual rhythm
- placeholder behavior
- section alternation
- UX/UI constraints

Agent MUST consult `DESIGN.md` when implementing:

- HTML structure
- CSS styling
- responsive layouts
- component composition
- spacing decisions
- typography usage
- visual hierarchy
- placeholders
- section backgrounds
- form appearance
- Swiper appearance

If conflict exists:

```text
AGENTS.md > DESIGN.md > tasklist.md
```

Rules:

- Agent MUST preserve design consistency with `DESIGN.md`.
- Agent MUST NOT invent visual patterns outside the design system.
- Agent MUST NOT introduce colors, spacing systems, typography rules or component variants not defined in `DESIGN.md`.
- Agent MUST treat `DESIGN.md` as implementation guidance, not optional inspiration.

### Design Extraction Rules

When reading `DESIGN.md`, agent must extract:

- deterministic layout constraints
- component structure
- spacing rules
- responsive behavior
- typography hierarchy
- color semantics
- accessibility implications
- forbidden patterns

Agent MUST avoid:

- subjective reinterpretation
- aesthetic improvisation
- speculative redesign
- visual embellishment not explicitly described
