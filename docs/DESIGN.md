---
version: alpha
name: Instituto Eufonía — Profe Pippo
description: Design system for the professional website of Lucas Jonathan Didolich (Profe Pippo), director of Instituto de Aprendizaje Musical Eufonía, Apóstoles, Misiones, Argentina. Dark mode only. Warm, approachable, classic musical tone.
colors:
  primary: '#e09f3e'
  secondary: '#ee964b'
  tertiary: '#9e2a2b'
  neutral: '#1f2029'
  background: '#17181d'
  surface: '#1f2029'
  on-primary: '#17181d'
  on-background: '#ffffff'
  on-surface: '#ffffff'
  text-muted: '#ffffffbf'
  bg-alt-1: '#540b0e'
  bg-alt-2: '#583101'
  bg-alt-3: '#603808'
  bg-alt-4: '#6f4518'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.2
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.7
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: 0.02em
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  sidebar-width: 240px
  content-max: 960px
  form-max: 600px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    typography: '{typography.label-md}'
    rounded: '{rounded.md}'
    padding: 12px 24px
  button-primary-hover:
    backgroundColor: '{colors.secondary}'
    textColor: '{colors.on-primary}'
  button-secondary:
    backgroundColor: 'transparent'
    textColor: '{colors.primary}'
    rounded: '{rounded.md}'
    padding: 11px 23px
  button-secondary-hover:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.primary}'
  button-disabled:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-muted}'
    rounded: '{rounded.md}'
    padding: 12px 24px
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.on-surface}'
    rounded: '{rounded.md}'
    padding: 24px
  card-instrument:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.on-surface}'
    typography: '{typography.label-md}'
    rounded: '{rounded.md}'
    padding: 16px
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.on-surface}'
    rounded: '{rounded.md}'
    padding: 12px 16px
  input-focus:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.on-surface}'
    borderColor: '{colors.primary}'
    rounded: '{rounded.md}'
    padding: 12px 16px
  nav-item:
    textColor: '{colors.text-muted}'
    typography: '{typography.label-md}'
    padding: 8px 16px
  nav-item-active:
    textColor: '{colors.primary}'
    typography: '{typography.label-md}'
    padding: 8px 16px
  timeline-dot:
    backgroundColor: '{colors.primary}'
    size: 12px
    rounded: '{rounded.full}'
  badge-year:
    backgroundColor: 'transparent'
    textColor: '{colors.primary}'
    typography: '{typography.label-md}'
---

# DESIGN.md — Instituto Eufonía / Profe Pippo

## Overview

This is the design system for the professional website of Profe Pippo (Lucas Jonathan Didolich), director of Instituto de Aprendizaje Musical Eufonía in Apóstoles, Misiones, Argentina. The design must simultaneously convey three ideas: **the warmth of a music studio**, **the credibility of a solid academic background**, and **the approachability of a patient, empathetic teacher**.

The visual result is an elegant dark mode with warm gold and wood-orange accents — colors that evoke acoustic instruments, polished wood, and old music scores. This is not a cold or corporate site. It is the visual equivalent of a well-lit music room: intimate, professional, and welcoming.

**Target audience:** families with children from age 7, adults of all ages, people with no prior musical experience. The design must be readable and accessible on mid-range mobile devices with slow connections.

**Absolute constraints:**

- Dark mode only. No light theme toggle.
- No animations of any kind.
- No stock images. The teacher's profile photo is the only visual anchor.
- Use lorem ipsum text in all content blocks.
- Use empty placeholders (rectangles with `{colors.surface}` background and dashed border in `{colors.primary}`) instead of any image, photo, or illustration.

---

## Colors

The palette is built on warm dark neutral backgrounds with a pair of accents that evoke wooden and brass musical instruments.

- **background (`#17181d`):** main page background. Warm dark neutral, not cold. Base for all primary sections.
- **surface (`#1f2029`):** elevated surface for cards, inputs, sidebar, and overlay menu. Slightly lighter than the background to create tonal depth without shadows.
- **primary (`#e09f3e`):** main accent. Warm gold. Used for section headings, the artistic name in the hero, active navigation items, input focus borders, the timeline dot, the primary button, and the favicon. Highest visual hierarchy color.
- **secondary (`#ee964b`):** secondary accent. Wood orange. Used as the primary button hover state and as a complementary detail to gold. Never competes with primary — it supports it.
- **tertiary (`#9e2a2b`):** dark red. Used exclusively for subtle dividers (footer top border) and as the error state color on `error.html`. Not used as an interactive text accent in the main flow.
- **on-background / on-surface (`#ffffff`):** white text on dark backgrounds. Primary text color.
- **on-primary (`#17181d`):** dark text on gold-background buttons. Ensures WCAG AA contrast.
- **text-muted (`rgba(255,255,255,0.75)`):** secondary text, captions, inactive nav items, form privacy notice text.
- **bg-alt-1 to bg-alt-4 (`#540b0e`, `#583101`, `#603808`, `#6f4518`):** dark palette variants for alternative section backgrounds. Create visual separation without borders or lines. Never used as text color, active border, or interactive accent.

---

## Typography

The typographic strategy combines two Google Fonts families with completely differentiated roles.

- **Playfair Display (serif):** exclusively for headings and the artistic name. Its high contrast between thick and thin strokes evokes music scores, music book covers, and academic diplomas. Reinforces the teacher's credibility and background. Used in gold (`primary`) or white on dark backgrounds. Never at small sizes.
- **Inter (sans-serif):** for all body text, labels, navigation, form fields, and UI text. Designed for maximum on-screen readability at small sizes. Neutral and modern, complements Playfair without competing.

**Usage rules:**

- Section headings use `headline-lg` in Playfair Display, color `primary`.
- The artistic name "Profe Pippo" in the hero uses `headline-xl` in Playfair Display, color `primary`.
- Body text uses `body-md` in Inter, color `on-background`.
- Navigation items use `label-md` in Inter.
- Privacy notice and secondary text use `body-sm` in Inter, color `text-muted`.
- Never mix more than two font weights on a single screen.

---

## Layout

The site is a single HTML page with anchor-based navigation. The layout changes completely based on viewport width.

**Desktop (≥ 1024px):**

- Fixed left sidebar, width `sidebar-width` (240px), full viewport height, `surface` background. Contains the artistic name at the top, navigation items in the center, and the Instagram link at the bottom.
- Main content area occupies the remaining width, with vertical scroll.
- Maximum content width: `content-max` (960px), centered within the main area.

**Mobile (< 1024px):**

- Sidebar disappears completely.
- Hamburger button in the top left corner. On click, opens a full-screen overlay with `surface` background and the same navigation items.
- Content occupies the full viewport width with `lg` (24px) horizontal padding.

**Contact form:** container with maximum width `form-max` (600px), horizontally centered on desktop. Full width on mobile.

**Instruments grid:** 4 columns on desktop, 2 columns on mobile.

**Section spacing:** `3xl` (64px) vertical padding per section.

**Visual section separation:** sections alternate between `background` and `surface` (or a `bg-alt` variant) backgrounds to create visual rhythm without borders or dividing lines.

---

## Elevation & Depth

Depth is achieved exclusively through tonal layers. No box-shadows or drop-shadows are used on any component.

- **Level 0 — page background:** `background` (`#17181d`).
- **Level 1 — elevated surface:** `surface` (`#1f2029`). Cards, sidebar, inputs, overlay menu.
- **Level 2 — active accent:** `primary` over surface. Input focus, active nav item, card hover border.

The contrast between `background` and `surface` is subtle but sufficient to communicate hierarchy. In sections with `bg-alt` backgrounds, cards maintain their `surface` background to preserve tonal differentiation.

---

## Shapes

The shape language is modern and clean, with moderate rounded corners that add warmth without infantilizing the design.

- **Cards and inputs:** `rounded.md` (8px). Enough softness to feel welcoming.
- **Buttons:** `rounded.md` (8px). Consistent with cards and inputs.
- **Timeline dot:** `rounded.full` (9999px). Perfect circle as the timeline marker.
- **Timeline year badges:** no background, text only in `primary`. No rounded border.
- **Favicon:** freeform shape (initial "P" on a `rounded.sm` square background).

Rounded and perfectly sharp corners are never mixed in the same view.

---

## Components

### Sidebar (desktop)

Fixed on the left margin, `surface` background, 100vh height. Vertical structure: artistic name "Profe Pippo" in `headline-md` Playfair Display color `primary` (top) → navigation items in `label-md` Inter color `text-muted` (center, active item in `primary`) → Instagram icon and link (bottom). Subtle right border in `tertiary` with reduced opacity.

### Hamburger menu (mobile)

Button with three horizontal lines icon in `primary`. On activation, full-screen overlay with `surface` background. Same items as the sidebar, vertically centered. Close button (×) in the top right corner.

### Hero

Profile image placeholder: 1:1 aspect ratio rectangle, `surface` background, dashed border in `primary`, no internal content. Desktop: placeholder on the left, text on the right. Mobile: placeholder on top, text below centered. Artistic name in `headline-xl` Playfair Display `primary`. Subtitle in `body-lg` Inter `text-muted`. Bio in `body-md` Inter `on-background`. Primary CTA button: "Consultar clases".

### Timeline (Trayectoria)

Central vertical line in `primary` with reduced opacity. Each entry: `badge-year` with year/period in `primary` `label-md`, `timeline-dot` in `primary`, milestone title in `body-md` Inter semibold `on-background`, description in `body-md` Inter `text-muted`. Entries stack vertically on both breakpoints.

### Instrument cards

Grid of `card-instrument`. Instrument name text centered, `label-md` Inter `on-surface`. 3px left border in `primary` as accent detail. **No icons. No descriptions. No links. Only the instrument name as text.**

### Services and availability (mandatory section)

This section is mandatory and must appear between the Instruments section and the Testimonials section. Two blocks on desktop (two columns), stacked on mobile:

- **Left block — teaching approach:** heading "Servicios" in `headline-lg` Playfair Display `primary`. Description paragraph in `body-md` Inter `on-background` with lorem ipsum text. Explicit mention: in-person classes, all levels, ages 7 to 100, Apóstoles and Azara.
- **Right block — availability:** card with `surface` background, `rounded.md`, `lg` padding. Heading "Disponibilidad" in `headline-md` Playfair Display `on-surface`. Days: "Martes a viernes" in `label-md` Inter `primary`. Time slots: "08:00 – 12:00" and "13:00 – 22:00" in `body-md` Inter `on-surface`. Clock icon (Unicons) in `primary` next to the heading.

### Testimonials carousel (Swiper.js)

Cards with `surface` background, testimonial text in typographic quotation marks in `body-md` Inter `on-surface`, student name in `label-md` Inter `primary`. Navigation arrows in `primary`, hidden when not needed. **Exactly 2 cards visible simultaneously on desktop. Exactly 1 card on mobile. Never show 3 cards.**

### Contact form

Fields with `surface` background, `on-surface` text, `surface` border at rest, `primary` border on focus, `rounded.md`. Labels above each field in `label-md` Inter `on-background`.

**Exact fields in this order (do not add or remove any):**

1. Nombre y apellidos (text)
2. Edad del interesado (number)
3. Instrumento de interés (select with placeholder "— Seleccioná un instrumento —" + conditional free text field for "Otro")
4. Teléfono de contacto (tel)
5. Email (email)

**Do not include any additional fields** (no "Mensaje" field, no "Consulta" field, no textarea of any kind).

Conditional free text field hidden by default, appears when "Otro" is selected. Privacy notice in `body-sm` Inter `text-muted` between the last field and the button. Submit button: "ENVIAR CONSULTA" in `button-primary` full width. Disabled state: `button-disabled`.

### Result pages (exito.html / error.html)

Card centered on screen over `background`.

- **Success (exito.html):** checkmark icon in `primary`, heading in `headline-md` Playfair Display `on-background`, body text in `body-md` Inter `text-muted`, "Volver al inicio" button `button-primary`.
- **Error (error.html):** warning icon in `tertiary`, heading in `headline-md` Playfair Display `on-background`, body text in `body-md` Inter `text-muted`, Instagram link as `button-secondary`, "Volver al formulario" button `button-primary`.

### Footer

Top border in `tertiary`. Artistic name in `label-md` Inter `primary`. Nav links in `label-md` Inter `text-muted`. Instagram link with Unicons icon in `text-muted`. Copyright in `label-sm` Inter `text-muted`. Desktop: single horizontal row. Mobile: stacked vertically, centered.

---

## Do's and Don'ts

- **Do** use `primary` (gold `#e09f3e`) as the highest visual hierarchy color. It is the only accent for section headings, active items, and the main CTA.
- **Do** use Playfair Display exclusively for headings. Never for body text or labels.
- **Do** maintain WCAG AA contrast on all text. `on-background` over `background` passes comfortably. Verify `text-muted` over `surface`.
- **Do** use empty placeholders (dashed `primary` border, `surface` background) instead of images or filler illustrations.
- **Do** use lorem ipsum text in all content text blocks.
- **Do** alternate section backgrounds between `background` and `surface` / `bg-alt` variants to create visual rhythm.
- **Don't** use any animations, including scroll transitions, parallax, or section fade-ins.
- **Don't** use light mode. This site is dark mode only.
- **Don't** use `tertiary` (`#9e2a2b`) as an interactive accent or text color in the main flow. Only for dividers and error state.
- **Don't** use `bg-alt-1` through `bg-alt-4` as text color, active border, or interactive accent. Only as section backgrounds.
- **Don't** mix rounded and sharp corners in the same view.
- **Don't** use more than two font weights in the same section.
- **Don't** place real images, stock photos, or illustrations. Only the profile image placeholder in the hero.
- **Don't** introduce any color not defined in the token palette. No blues, greens, purples, or any color outside this system. If a fourth semantic color is needed, that is `tertiary` (`#9e2a2b`), not a blue.
- **Don't** add icons to instrument cards. Only the instrument name as plain text.
- **Don't** add fields to the contact form outside the exact list of 5 fields. In particular, do not add a "Mensaje" field or any textarea.
- **Don't** omit the Services and Availability section. It is mandatory and must appear between Instruments and Testimonials.
- **Don't** show 3 cards in the testimonials carousel on desktop. The maximum is 2.
