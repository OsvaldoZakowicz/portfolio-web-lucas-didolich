# Task List

This document defines the implementation roadmap for the repository.

The repository already exists and already contains:

- `README.md`
- `LICENSE`
- `develop` branch
- `main` branch
- `/locales/es.json`
- `/docs/AGENTS.md`
- `/docs/DESIGN.md`
- `/docs/tasklist.md`

Agent MUST preserve existing repository architecture and follow `AGENTS.md` at all times.

---

# Global Invariants

These rules apply to ALL tasks.

## Repository Stability

After EVERY completed task:

- HTML must remain valid
- CSS must remain valid
- JavaScript must remain parseable
- Imports must remain resolvable
- No missing referenced files
- CI must remain passable
- No runtime-breaking partial implementations

---

## Scope Rules

Agent MUST:

- modify ONLY files required by the current task
- preserve protected files
- avoid unrelated refactors
- avoid speculative abstractions
- avoid future-task leakage

Agent MUST NOT:

- self-assign future tasks
- implement future tasks proactively
- rewrite unrelated files
- introduce build tooling
- introduce dependencies outside AGENTS.md

---

## Local Validation Policy

The following tools are installed globally and are the ONLY validation tools available locally.
Agent MUST use these tools for acceptance criteria verification.

| Tool          | Version  |
| ------------- | -------- |
| html-validate | 11.3.0   |
| stylelint     | 17.12.0  |
| eslint        | 10.4.0   |
| node          | v24.11.0 |

### Rules

- Agent MUST use these tools directly from the command line.
- Agent MUST NOT install additional packages locally or globally via npm, pnpm, yarn or any other package manager.
- Agent MUST NOT use `npm audit`, `npx`, `node_modules/.bin` or any package runner.
- Agent MUST NOT improvise validation with `fs`, `console.log`, `String.includes()` or any Node.js manual check as substitute for linting.
- Agent MUST NOT retry the same validation check more than once unless a fix was applied between retries.
- Node.js manual checks via `fs` are allowed ONLY for verifying file existence and JSON parseability, never as linting substitutes.

### Validation commands per file type

HTML files:

```bash
html-validate --config .html-validate.json "**/*.html"
```

CSS files:

```bash
stylelint "assets/css/**/*.css"
```

JS files:

```bash
eslint "assets/js/**/*.js"
```

JSON files:

```bash
node -e "JSON.parse(require('fs').readFileSync('locales/es.json','utf8')); console.log('ok')"
```

File existence:

```bash
node -e "const f=require('fs'); ['index.html','exito.html','error.html'].forEach(p=>console.log(p, f.existsSync(p)?'ok':'MISSING'))"
```

### CI as final defense

Local validation must pass before every commit.
CI via GitHub Actions on pull request to `main` is the final and authoritative validation line.
A passing CI does not replace local validation — both are required.

### Unverifiable criteria

If a criterion cannot be verified with the available tools or Node.js built-ins, agent MUST:

1. Report the criterion as unverifiable with a brief reason.
2. Continue to the next criterion without retrying.
3. If all criteria have been processed, finalize and report the full results summary.

Agent MUST NOT block task completion on unverifiable criteria.
Agent MUST NOT attempt alternative or improvised verification methods.

---

# Task 01 — Establish Minimal Technical Bootstrap

## Objective

Create the minimum valid project baseline required for incremental development and future CI compatibility.
The objective of this task is ONLY to establish a minimal parseable and extendable repository structure.
This task must NOT implement application features, layouts, rendering systems or business logic.

## Allowed Files

- `/index.html`
- `/exito.html`
- `/error.html`
- `/assets/css/styles.css`
- `/assets/js/main.js`
- `/assets/js/i18n.js`
- `/netlify.toml`

## Requirements

### HTML

Create minimal valid HTML5 documents for:

- `index.html`
- `exito.html`
- `error.html`

Each document must include:

- valid `<!DOCTYPE html>`
- `<html lang="es">`
- `<head>`
- charset declaration
- viewport meta tag
- title
- stylesheet reference
- required CDN references from `AGENTS.md`
- minimal `<body>` structure

Do NOT implement final semantic structure yet.

---

### CSS

Create `/assets/css/styles.css` with minimal valid foundational CSS.

Required minimum reset:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

* {
  margin: 0;
  padding: 0;
}
```

No design system implementation yet.

---

### JavaScript

Create minimal valid JS module structure.

`main.js` must:

- import `i18n.js`
- register `DOMContentLoaded`
- initialize minimal async bootstrap safely

`i18n.js` must expose minimal stub APIs:

- `init()`
- `t()`
- `getLocale()`

Implementations may remain minimal placeholders for future tasks.

---

### Netlify

Create minimal valid:

```text
/netlify.toml
```

with basic static hosting configuration.

---

## Explicitly Forbidden

- final page layout
- semantic section implementation
- navigation systems
- dynamic rendering
- Swiper initialization
- form validation
- accessibility system implementation
- responsive behavior implementation
- localization rendering implementation
- modifying locale files
- touching `/locales/es.json`
- touching `/locales/en.json`

## Acceptance Criteria

- all required files exist
- all HTML files parse correctly
- CSS parses correctly
- JS modules resolve correctly
- no broken imports exist
- repository remains CI-compatible
- no runtime-breaking errors occur from bootstrap code
- repository is ready for incremental task execution

---

# Task 02 — Implement GitHub Actions CI

## Objective

Implement the exact CI pipeline defined in `AGENTS.md`.

## Allowed Files

- `/.github/workflows/ci.yml`
- `/.html-validate.json`
- `/.stylelintrc.json`
- `/eslint.config.js`

## Requirements

Implement exactly:

- html-validate job
- stylelint job
- eslint job

Using:

- ubuntu-latest
- Node.js 20

Create required linter configuration files in the repository root.

`.html-validate.json`:

```json
{
  "extends": ["html-validate:recommended"],
  "rules": {
    "no-trailing-whitespace": "off",
    "doctype-style": "off",
    "void-style": "off"
  }
}
```

`.stylelintrc.json`:

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "selector-class-pattern": null,
    "custom-property-empty-line-before": "never"
  }
}
```

`eslint.config.js` — ESLint v9+ format, NOT `.eslintrc.json`:

```js
export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        Swiper: 'readonly',
      },
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'no-eval': 'error',
      'no-unused-vars': 'warn',
    },
  },
];
```

CI workflow must use explicit config flag for html-validate:

```yaml
- run: html-validate --config .html-validate.json "**/*.html"
```

## Forbidden

- additional workflows
- matrix builds
- deploy jobs
- artifact generation
- build tooling

## Acceptance Criteria

- workflow syntax valid
- exactly 3 jobs exist
- workflow matches AGENTS.md contract
- all three linter config files exist in repository root
- html-validate job uses `--config .html-validate.json` flag explicitly
- eslint config uses ESLint v9+ flat config format (`eslint.config.js`)
- CI passes green on GitHub Actions

---

# Task 03 — Implement i18n.js

## Objective

Implement the localization system contract and DOM localization resolution behavior.
Task 01 created placeholder APIs only.
This task replaces bootstrap placeholders with functional implementation.

## Allowed Files

- `/assets/js/i18n.js`

## Requirements

Implement public API:

- `init()`
- `t(key)`
- `getLocale()`

Responsibilities:

- fetch active locale
- resolve `[data-i18n]`
- resolve `[data-i18n-placeholder]`
- resolve `[data-i18n-aria-label]`
- update document language
- update metadata
- expose deterministic translation lookup API

Localization behavior:

- `data-i18n` resolves text content
- `data-i18n-placeholder` resolves `placeholder`
- `data-i18n-aria-label` resolves `aria-label`

Implementation must:

- use deterministic key lookup
- fail safely for missing keys
- use defensive DOM checks
- report localization failures with `console.error`

## Forbidden

- HTML generation
- component rendering
- business logic
- fallback locale systems
- inline translation maps
- framework-like abstractions
- hardcoded UI copy injection outside localization flow

## Acceptance Criteria

- locale fetch works
- all supported localization attributes resolve correctly
- document language updates correctly
- missing keys handled safely
- no console errors during normal execution
- repository remains CI-passable

---

# Task 04 — Implement Semantic index.html Skeleton

## Objective

Implement the complete semantic HTML structure for the single-page application.
This task establishes the definitive semantic HTML structure of the application.
This task may substantially extend the minimal bootstrap HTML created in Task 01.

## Allowed Files

- `/index.html`

## Requirements

Implement:

- sidebar
- mobile overlay
- all required sections
- semantic structure
- accessibility attributes
- localization hooks
- empty dynamic containers

Required sections order:

1. `#inicio`
2. `#trayectoria`
3. `#instrumentos`
4. `#servicios`
5. `#testimonios`
6. `#contacto`
7. `#footer`

Consult `/docs/DESIGN.md` for:

- semantic layout composition
- sidebar structure
- hero composition
- section rhythm
- responsive structure

Consult `/docs/fase-4-spec-tecnica.md` for:

- exact HTML contracts per section (sections 5.2 to 5.11)
- exact IDs, aria attributes and localization hooks per component
- exact CSS utility classes per section
- data-i18n key mapping per element
- form field IDs, names and aria-describedby contracts
- Netlify Forms required attributes

Localization rules:

- all user-visible text must use localization hooks
- use `data-i18n` for text nodes
- use dedicated localization attributes where required
- avoid hardcoded UI copy unless explicitly required by spec

Examples:

```html
<h2 data-i18n="services.title"></h2>

<input
  data-i18n-placeholder="form.email.placeholder"
  data-i18n-aria-label="form.email.label"
/>
```

HTML responsibilities:

- structure
- semantics
- accessibility
- localization hooks

Text content must be resolved later by `i18n.js`.

Dynamic sections must include valid empty containers for future rendering:

- timeline container
- testimonials swiper wrapper

## Forbidden

- inline scripts
- inline styles
- complex JS behavior
- static hardcoded timeline entries
- static hardcoded testimonial entries
- placeholder business logic

## Acceptance Criteria

- semantic structure complete
- accessibility attributes present
- localization hooks correctly implemented
- all required IDs/spec contracts preserved
- dynamic containers exist and are valid
- repository remains CI-passable

---

# Task 05 — Implement exito.html and error.html

## Objective

Create post-submit pages exito and error.
Extend bootstrap pages created in Task 01.

## Allowed Files

- `/exito.html`
- `/error.html`

## Requirements

Implement:

- semantic HTML
- consistent visual system
- accessibility compliance
- navigation back to homepage

## Forbidden

- unnecessary scripts
- complex layouts

## Acceptance Criteria

- pages valid
- pages accessible
- pages consistent with design system

---

# Task 06 — Implement styles.css Foundation

## Objective

Implement foundational visual system.
Extend the minimal CSS reset created in Task 01.

## Allowed Files

- `/assets/css/styles.css`

## Requirements

Implement:

- design tokens
- typography
- layout foundations
- nav styles
- responsive foundations
- Swiper overrides

Visual implementation must follow `/docs/DESIGN.md`. Including:

- tonal depth system
- background alternation
- typography hierarchy
- placeholder appearance
- spacing rhythm
- shape language
- elevation rules

## Forbidden

- animations
- gradients
- glassmorphism
- excessive !important
- JS-driven styling

## Acceptance Criteria

- responsive foundations work
- tokens implemented
- typography correct
- CSS remains maintainable

---

# Task 07 — Implement main.js Orchestration

## Objective

Implement initialization orchestration.
Replace bootstrap initialization with final orchestration structure.
Future initialization modules may temporarily remain minimal stubs until their corresponding tasks are implemented.

## Allowed Files

- `/assets/js/main.js`

## Requirements

Implement:

- DOMContentLoaded listener
- sequential initialization
- defensive checks
- initialization order defined in AGENTS.md

All subordinate functions must be declared as named empty stubs if not yet implemented:

```js
function initTimeline() {}
function initTestimonials() {}
function initNav() {}
function initHamburger() {}
function initIntersectionObserver() {}
function initForm() {}
```

Stubs must be declared in the same file and must not be removed, renamed or relocated by future tasks unless the task explicitly requires it.

## Forbidden

- business logic
- rendering logic
- validation rules
- localization logic

## Acceptance Criteria

- initialization order deterministic
- runtime stable
- imports valid

---

# Task 08 — Implement initTimeline()

## Objective

Render trajectory timeline dynamically from locale data.
Requires semantic containers introduced in Task 04.

## Allowed Files

- `/assets/js/main.js`
- `/index.html`

## Requirements

Generate timeline entries dynamically inside:

```text
#timeline-list
```

## Forbidden

- modifying i18n.js API
- static hardcoded timeline entries
- unrelated rendering systems

## Acceptance Criteria

- timeline renders correctly
- structure matches spec
- accessibility preserved

---

# Task 09 — Implement initTestimonials()

## Objective

Render testimonials and initialize Swiper.
Requires Swiper structural containers introduced in Task 04.

## Allowed Files

- `/assets/js/main.js`
- `/index.html`
- `/assets/css/styles.css`

## Requirements

Implement:

- dynamic slide rendering
- Swiper initialization
- exact configuration from AGENTS.md

## Forbidden

- alternative slider systems
- dynamic reconfiguration
- custom carousel implementation

## Acceptance Criteria

- Swiper works correctly
- responsive behavior correct
- disabled arrows hidden correctly

---

# Task 10 — Implement Responsive Navigation

## Objective

Implement navigation behavior for desktop and mobile.
Requires navigation structure introduced in Task 04.

## Allowed Files

- `/assets/js/main.js`
- `/index.html`
- `/assets/css/styles.css`

## Requirements

Implement:

- active nav states
- hamburger toggle
- overlay open/close
- overlay dismissal behavior
- aria-expanded updates

## Forbidden

- animation libraries
- hidden state managers
- event buses

## Acceptance Criteria

- keyboard accessible
- responsive behavior correct
- overlay behavior stable

---

# Task 11 — Implement IntersectionObserver Navigation Sync

## Objective

Synchronize visible sections with active navigation state.
Requires navigation system from Task 10.

## Allowed Files

- `/assets/js/main.js`

## Requirements

Implement:

- IntersectionObserver
- active link synchronization
- threshold behavior from spec

## Forbidden

- scroll listeners replacing observer
- custom navigation systems

## Acceptance Criteria

- active states update correctly
- no excessive DOM work
- runtime stable

---

# Task 12 — Implement Contact Form Logic

## Objective

Implement full form behavior and validation.
Requires semantic form structure introduced in Task 04 and styling foundation from Task 06.

## Allowed Files

- `/assets/js/main.js`
- `/index.html`
- `/assets/css/styles.css`

## Requirements

Implement:

- conditional "other instrument" field
- validation rules
- accessible error messages
- submit-state behavior
- aria-live behavior
- cross-field validation

## Forbidden

- additional fields
- textarea/message field
- third-party validation libraries

## Acceptance Criteria

- all validations work
- accessibility preserved
- no invalid submit leakage

---

# Task 13 — Finalize netlify.toml

## Objective

Implement final Netlify configuration.

## Allowed Files

- `/netlify.toml`

## Requirements

Implement:

- publish configuration
- SPA redirect configuration
- security-compatible static hosting setup

## Forbidden

- build commands
- SSR
- edge/server runtimes

## Acceptance Criteria

- configuration valid
- deploy compatible with static hosting

---

# Task 14 — Final Compliance and QA Audit

## Objective

Perform final spec-compliance verification.

## Allowed Files

- any required minimal-diff corrections

## Requirements

Verify compliance against all authoritative sources in priority order:

- `AGENTS.md` — operational rules, forbidden patterns, stack constraints, initialization order
- `DESIGN.md` — visual system, typography, layout, responsive behavior, component appearance
- `/docs/fase-4-spec-tecnica.md` — HTML contracts, data schemas, module interfaces, Netlify configuration

Verification checklist:

- all section IDs match spec contracts
- all `data-i18n` keys exist in `es.json`
- all `aria-*` attributes present per component contract
- initialization order matches AGENTS.md section 12
- localization resolves correctly for all supported attributes
- conditional form field behavior works correctly
- Swiper configuration matches AGENTS.md section 14
- responsive layout correct at mobile and desktop breakpoints
- no forbidden patterns introduced
- no console errors during normal execution
- CI remains passable

## Forbidden

- architecture rewrites
- speculative cleanup
- unrelated refactors

## Acceptance Criteria

- repository fully spec-compliant
- CI green
- responsive behavior validated
- accessibility preserved
- runtime stable
