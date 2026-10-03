# LockBudget UI — Figma SVG Export Package

This directory contains the complete automated SVG export of the **54 HTML pages** of the LockBudget UI.

## Directory Structure

```
figma-export/
├── svg/                   # 64 SVG files (54 viewport frames + 10 tall full artboards)
│   ├── <page>.svg         # 390×844 viewport SVG at scroll position 0
│   └── <page>--full.svg   # 390×tall artboard showing complete scroll content
├── ref/                   # Chromium reference screenshots for visual verification
├── diffs/                 # Pixelmatch diff maps (Resvg and Chromium)
├── report.md              # Comprehensive 54-page audit, mismatch tables & metrics
├── bulk-results.json      # Raw verification data for all pages
└── README.md              # This file
```

---

## How to Import into Figma

### 1. Prerequisites
- **Install Font**: Ensure the font **Source Sans 3** is installed on your local operating system. All SVG text elements use `font-family="Source Sans 3"` without fallback lists so Figma maps them directly to live editable text layers without missing-font warnings.

### 2. Importing SVGs
- Simply **drag and drop** the `.svg` files from `figma-export/svg/` into your Figma canvas, or use **File > Place image...** (`Cmd/Ctrl + Shift + K`).
- Figma imports each file as a clean artboard frame containing vector layers, native gradients, live text, and embedded bitmap images. No `<foreignObject>` tags or external asset dependencies exist.

---

## Prototype Configuration for Scrollable Pages

Ten pages in the design have scrollable content extending below the fold:
1. `budget.html` (1446px full content)
2. `home-dashboard.html` (1013px full content)
3. `profile-window.html` (1004px full content, bottom sheet modal)
4. `user-profile.html` (985px full content)
5. `save-goal-setup.html` (950px full content)
6. `settings.html` (947px full content)
7. `activity-detail-failed.html` (955px full content)
8. `save-period-setup.html` (900px full content)
9. `activity-detail-sync-delayed.html` (919px full content)
10. `budget-recap.html` (748px full content)

### Exact Figma Setup Instructions:
1. **Root 390×844 Frame**:
   - In the **Design** panel (right sidebar), check **Clip content**.
   - In the **Prototype** panel, set **Overflow behavior** to **Vertical scrolling**.
2. **Fixed Header & Footer**:
   - Select the `fixed-header` group and the `fixed-footer` group (if present) in the layers panel. They are direct children of the root frame.
   - In the **Prototype** panel, set **Position** (or Scroll behavior) to **Fix position when scrolling**.
3. **Scrollable Content**:
   - The `scroll-content` group remains a direct child of the root frame. Its contents extend beyond the 844px frame boundary and will scroll smoothly beneath the pinned header and footer.
   - **Do not convert `scroll-content` into a nested frame.** Leaving it as a group allows Figma to calculate the scroll bounds from the root frame's overflow settings.
4. **Modal / Dimmed Backgrounds**:
   - For `profile-window.html`, the `dimmed-background` layer group is positioned at the back with `opacity="0.55"`, matching the background dim of the active bottom sheet.

### Using `--full.svg` Artboards
For each of the 10 scrollable pages, a companion `<page>--full.svg` is provided. This is a single tall artboard (390 × full content height) with the header at the top, all list items laid out in sequence, and the footer pinned at the bottom. Use these for review, full-page design inspection, or design system presentations.

---

## Notes & Uncertainties

- **Figma "Fix position when scrolling" Requirement**: Figma only allows "Fix position when scrolling" on elements that are **direct children** of a top-level frame. Our exported viewport SVGs structure `fixed-header`, `scroll-content`, and `fixed-footer` as direct children of the root `<svg>` element specifically to satisfy this constraint.
- **Rendering Engines Notice**: All visual mismatch calculations in `report.md` were performed using headless rendering engines (**Playwright Chromium** and **@resvg/resvg-js** against browser reference screenshots). They were not verified inside the proprietary Figma desktop application.
