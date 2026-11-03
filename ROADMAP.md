# Roadmap

This is a small, opinionated diorama rather than a platform. The roadmap is a list of directions,
not commitments; issues and pull requests are welcome.

## Near term

- **More Bangkok icons**: Democracy Monument, the Chinatown gate, ICONSIAM's river frontage, a
  khlong-side market or a second bridge with a distinct silhouette.
- **A canal or two**: a narrow khlong with small boats would make the west bank read more like
  Thonburi without widening the tray.
- **Richer river life**: a pier queue, a ferry stop with waiting passengers, and a long-tail wake
  that fades with distance.
- **Mobile polish**: verify the compact layout on a physical phone, not only touch emulation.
- **Performance pass**: measure the draw-call and triangle budget on low-end hardware, then decide
  whether a distance-based LOD for windows is worth the complexity.
- **Accessibility**: a reduced-motion screenshot pass, focus order review, and contrast checks for
  the Thai labels.

## Later

- **More locales**: a third locale and a small language menu instead of a two-way toggle.
- **A city generator**: extract the geography + plan + kit pipeline so another city can be authored
  without copying the Bangkok scene.
- **Optional postcards**: a poster export with the title lockup, not just a raw canvas PNG.
- **Guided tour**: a scripted camera sequence with captions for a launch page or a kiosk.

## Non-goals

- Survey-accurate geography, navigation, GIS import or live traffic.
- Photo-to-3D reconstruction or photorealistic rendering.
- Accounts, analytics, server-side rendering or runtime network calls.
- Redistributing third-party brand marks, fonts or imagery.

## How to propose a change

Open an issue with the visual or interaction problem first. A small mockup, a reference photograph
or a description of the camera view is more useful than a large speculative patch.
