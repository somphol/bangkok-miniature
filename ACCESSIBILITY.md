# Accessibility

The project aims for a usable, keyboard-accessible experience. It is not a certified WCAG audit;
this page states what is supported, what is not, and how to report a problem.

## Supported

- **Keyboard access.** Every overlay control is a native `<button>` or `<a>` and is reachable in DOM
  order. Focus-visible outlines are defined for buttons and links. The canvas itself is not
  focusable; the landmark buttons are the primary way to move the camera without a pointer.
- **Names and state.** Icon-only controls have `aria-label`s; toggles expose `aria-pressed`; the
  landmark bar exposes the selected landmark; the info card has a labelled close button; the scene
  container has an `aria-label`.
- **Landmark content.** The info card is the accessible description of the selected landmark: area,
  name and a short text. A screen-reader user can select any landmark from the bar and read the card
  without needing the 3D canvas.
- **Reduced motion.** `prefers-reduced-motion: reduce` turns camera flights into cuts and makes the
  day/night switch instant. Auto-rotate is off by default.
- **Responsive layouts.** The full, compact and 345×345 embed layouts are laid out with CSS; the
  compact landmark bar is a 4×2 grid so every button stays on screen.
- **Touch.** Orbit and pinch zoom are handled by OrbitControls; the landmark bar uses normal touch
  targets.
- **Language.** The document `lang` attribute and the visible copy switch together. Thai line
  breaking and screen-reader pronunciation use the `th` language tag.
- **Contrast.** The primary text/panel pairs are cream on deep teal (day) and pale ink on dark navy
  (night). The gold accent is used for large text and controls, not for small body copy.

## Known gaps

- The 3D canvas has no full text equivalent. The landmark card describes the selected landmark, but
  there is no complete text tour of the city, traffic or water.
- There is no custom focus trap in the screenshot dialog; it is a small modal with a close button,
  and the page behind remains in the tab order.
- The Thai UI depends on a system Thai font. A minimal Linux image without one will show fallback
  glyphs or boxes.
- Auto-rotate and camera flights are visual effects; they cannot be perceived non-visually. The
  reduced-motion path is the recommended alternative.
- The compact bar uses short landmark labels; the full name is exposed as the button's accessible
  name.
- A formal audit with a screen reader on every platform has not been completed.

## Reporting an accessibility problem

Open an issue with the **Accessibility** label (or use the bug report template) and include:

- the browser, OS and assistive technology;
- the URL and parameters (`?lang`, `?embed`);
- what you expected and what happened;
- whether keyboard, touch, zoom or reduced motion is involved.

Accessibility fixes are prioritised alongside visual regressions.
