LockBudget — Figma import package (design work, Oct 2026)
==========================================================
Everything designed in this session, as files you can drop straight into Figma.
(Phase 1 onboarding is NOT in here — it shipped earlier as figma_import_svgs.zip.)

What to import
--------------
Each folder has the group arranged the way you'd present it:
  <group>_all.svg   ALL frames of the group side-by-side with their captions —
                    place this one to get the whole flow in one go.
  <group>_all.png   3x pixel-true screenshot of the same arranged strip
                    (reference ground truth).
  frames/           the same screens one-by-one (NN_name.svg + .png each),
                    for dropping individual frames onto the canvas.

The SVGs are editable structure, not flattened screenshots:
  - vector shapes (cards, chips, bars, toggles, icons)
  - gradients where used (the dark hero cards)
  - Otis illustrations embedded as image fills
  - TEXT is embedded as crisp 3x images. Why: the real <text> layers in the
    first version carried a text-anchor that both Figma's SVG importer and
    stock SVG viewers mis-honored, so text landed off-position (the "things
    moving to the left" you saw). Image text is pixel-identical to the screens
    and positions identically everywhere because it has no anchor to honor.
    If you need editable copy, retype it in Inter with these specs:
    titles 21/800, body 12-14/500-700, hero big 21.5-22/800 white,
    hero small 12.5/500 @72% white, section labels 14/700, side notes 11.5/600
    (#93AFAA), values 13/700, ₦ is a normal character in Inter.

Import how
----------
File > Place (or drag & drop) the .svg. Each frame is 390x844 inside the strip.
Keep the matching _all.png behind the frame as a visual checkpoint.

Folders (design order)
----------------------
01_recap                 September recap (Otis celebration)
02_budget_outcome        Group 1 — left-over money + 3 outcome confirmations
03_quicksend_food        Group 2 — Food quick spend (daily budget)
04_quicksend_electricity Group 2 — Electricity quick spend (monthly budget)
05_quicksend_internet    Group 2 — Data/Internet quick spend (weekly budget)
06_emergency             Group 3 — fund / release override / cooldown
07_offline               Group 4 — offline popup (Otis fixing the cable) + banner
08_failure_states        Group 5 — bank maintenance / provider unavailable /
                         failed transaction (reversed)
09_profile_account       Group 6 completion — LockBudget top-up account,
                         Change PIN (current / new / updated)
10_help_trace            Group 6 completion — Report a transaction (QR-1112
                         trace) + open case CS-2210

Verified (this revision)
------------------------
Every file was checked by reading the SVG data directly (no rendering):
  - 41/41 SVGs contain ZERO real <text> elements (all text is positioned
    3x images, so no viewer or importer can shift it).
  - 41/41 SVGs: every shape and image lies fully inside its canvas
    (frames 390x844, strips 2552x870). No negative coordinates, no
    content below the phone's fold.
  - Cross-checked with two independent renderers (rsvg + headless Chrome);
    both match the 3x PNG ground truth pixel-for-pixel.

Notes
-----
- Colors are the LockBudget tokens: ink #0E3039, hero dark #0E3039→#16494F,
  teal #37B1A7, deep #1F7D76, soft #E3F2F0, line #E1EAE8, muted #48645F,
  faint #93AFAA, field #F1F4F4, bg #FBFDFD, alert red #FCEBE8/#A8473D.
- All data is mock and internally consistent: ₦50,000 September budget,
  ₦36,750 spent, ₦13,250 saved; references QR-1104/1108/1112, WD-7042,
  EM-0042, case CS-2210; LockBudget account 0234 567 890; personal bank
  0187 456 123 (Kuda Microfinance Bank, Yakubu Manage).
- Group 6 mechanics (top-up timing, PIN rules, trace SLAs, case numbers) are
  INVENTED — confirm when they matter.
- Home v2 lives in lockbudget_app.penpot (select the frame → Export as SVG in
  Penpot, or ask and it will be added here).
