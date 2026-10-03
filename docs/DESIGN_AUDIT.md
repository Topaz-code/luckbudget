# LOCKBUDGET — DESIGN SYSTEM AUDIT & TOKEN SPECIFICATION

**Generated:** Phase 1 Discovery & Audit  
**Source of Truth:** `lockbudget.penpot` (6,925 JSON AST nodes), `Group 5.png`, `figma_renders/`  
**Target Codebase:** `lockbudget_app/lib/theme/app_theme.dart`

---

## 1. Verified Color Token Palette

Based on full AST traversal of all 6,178 shapes in the exported design system, here are the exact color tokens, occurrence frequencies, and canonical role assignments:

| Token Name | Hex Value | Occurrences | Semantic Role & Visual Application |
|---|---|---|---|
| `primaryTeal` | `#0E3039` | 2,319 | **Primary Brand Color.** Headers, hero background cards, primary button backgrounds, high-emphasis text, Otis logo text. |
| `textSecondary` / `sageMuted` | `#48645F` | 1,635 | **Secondary / Muted Text & Icons.** Subtitles, unselected navigation icons, inactive category labels, table headers. |
| `cardSurface` | `#FFFFFF` | 1,122 | **Card & Container Background.** Quick spend cards, transaction list items, white modal sheets, input field surfaces. |
| `borderLight` | `#E1EAE8` | 558 | **Borders & Dividers.** Card outlines (1px solid), list item dividers, progress bar background tracks. |
| `accentTurquoise` | `#37B1A7` | 220 | **Brand Accent / Otis Turquoise.** Active interactive pills, primary action buttons, active tab icons, progress indicators. |
| `accentTurquoiseDark` | `#1F7D76` | 216 | **Dark Accent / Pressed State.** Pressed button states, high-contrast badges, dark variant tags. |
| `pillBackground` | `#E3F2F0` | 155 | **Soft Container / Pill Background.** Background for category pills (Food, Airtime), active tab background indicator, soft highlight tags. |
| `black` | `#000000` | 149 | **Absolute Black.** System status bar text/icons, deep drop shadow tints. |
| `cardSurfaceSecondary`| `#E4EBEA` | 123 | **Secondary Card Background.** Inactive input borders, secondary background for segmented controls. |
| `background` | `#FBFDFD` | 114 | **Scaffold Background.** Universal application scaffold canvas color (ultra-light cool mint tint). |
| `dividerMuted` | `#F1F4F4` | 87 | **Soft Dividers.** Hairline dividers between transaction dates. |
| `cardSurfaceSoft` | `#EEF3F2` | 62 | **Container Fill.** Neutral card container fill, receipt card inner container. |
| `warningGold` | `#F2B32A` | 48 | **Warning & Alert Accent.** Pending status badge, budget threshold warning, caution alerts. |
| `warningDark` | `#9B6A00` | 28 | **Warning Text.** Text on amber warning containers. |
| `dangerRed` | `#C7574E` / `#A8473D` | 38 | **Danger & Failure.** Failed transaction badge, budget exceeded alert, delete account button, emergency unlock penalty badge. |
| `successGreen` | `#00A870` | 12 | **Success & Growth.** Done status badge, income transfer badge (+₦25,000), completed goal checkmark. |

### Contrast & Accessibility (a11y) Verification:
* `#0E3039` on `#FBFDFD`: Contrast ratio **14.2:1** (Exceeds WCAG AAA).
* `#0E3039` on `#37B1A7`: Contrast ratio **4.8:1** (Meets WCAG AA for bold text).
* `#FFFFFF` on `#0E3039`: Contrast ratio **14.5:1** (Exceeds WCAG AAA).
* `#48645F` on `#FFFFFF`: Contrast ratio **5.1:1** (Meets WCAG AA).

---

## 2. Verified Typography System

The design system exclusively utilizes the **Source Sans** family across all screens:

### Font Families Found:
* **`Source Sans 3`** (3,420 instances)
* **`Source Sans Pro`** (262 instances)
* **Google Fonts Package:** `google_fonts: ^6.1.0` or local bundled assets will supply `Source Sans 3`.

> [!WARNING]
> **Repository Discrepancy Found:**  
> The existing `lockbudget_app/lib/theme/app_theme.dart` sets `fontFamily: 'Roboto'`.  
> In Phase 2, this must be switched to `Source Sans 3` (Google Fonts or local asset) to achieve pixel fidelity with the Figma source.

### Font Weights:
* **Bold (`FontWeight.w700`)**: 3,168 instances (Used for hero figures, card titles, button labels, key amounts).
* **Regular (`FontWeight.w400`)**: 514 instances (Used for body text, subtitles, secondary metadata, notes).

### Type Scale & Hierarchy:

| Hierarchy Role | Font Size | Weight | Line Height | Letter Spacing | Example Use Case in LockBudget |
|---|---|---|---|---|---|
| **Display Hero** | `27.0px` | Bold (`700`) | 1.15 | -0.5px | Hero Today's Allowance: **₦7,500.00** |
| **Headline Large** | `22.0px` | Bold (`700`) | 1.20 | -0.2px | Card Total Balance: **₦184,250.00**, Onboarding titles |
| **Title Medium** | `18.0px` | Bold (`700`) | 1.25 | 0.0px | Screen titles ("Budget & Recap", "Savings Hub") |
| **Title Small** | `15.5px` | Bold (`700`) | 1.25 | 0.0px | Section headers ("Quick Spend Categories", "Recent Activity") |
| **Body Large** | `15.0px` | Regular (`400`) / Bold (`700`) | 1.30 | 0.0px | Primary CTA Button labels ("Spend", "Lock it in", "Continue") |
| **Body Medium** | `14.0px` | Regular (`400`) | 1.30 | 0.0px | Transaction item titles, input field values |
| **Body Small** | `13.5px` | Regular (`400`) / Bold (`700`) | 1.20 | 0.0px | Category card subtitles, currency breakdowns |
| **Caption Regular** | `12.5px` | Regular (`400`) | 1.20 | 0.0px | Transaction timestamps, date group headers ("TODAY") |
| **Caption Small** | `11.5px` | Regular (`400`) | 1.15 | 0.0px | Status badge text ("DONE", "PENDING", "FAILED") |
| **Overline / Micro** | `9.0px` - `11.0px` | Bold (`700`) | 1.10 | +0.5px | Small tag badges, tabular column labels |

---

## 3. Verified Geometry, Radii & Elevations

### Corner Radii (Extracted from Vector Bezier Paths):
* **Buttons (Primary & Secondary):** **`14.0px`** border radius.
  - Button height is universally **`50.0px`**.
* **Standard Content Cards:** **`18.0px` to `20.0px`** border radius.
  - Used for category cards, transaction summary cards, and settings groupings.
* **Hero Highlight Cards:** **`21.0px`** border radius.
  - Used for "Today's Allowance Hero Card" and "Total in LockBudget Card".
* **Pills & Status Chips:** **`999.0px`** (Continuous stadium pill shape).
  - Used for category selector chips, transaction status pills, and Otis level badges.
* **Modal Bottom Sheets:** **`24.0px`** top-left and top-right corner radius.

### Spacing Scale:
* LockBudget strictly adheres to an **8pt / 4pt grid system**:
  - `space4` = 4.0px
  - `space8` = 8.0px
  - `space12` = 12.0px (Inter-card horizontal/vertical gap)
  - `space16` = 16.0px (Standard container internal padding)
  - `space20` = 20.0px (Universal screen horizontal margin)
  - `space24` = 24.0px (Header vertical spacing, form vertical rhythm)
  - `space32` = 32.0px (Section separation)
  - `space40` = 40.0px (Hero top padding)

### Shadows & Elevation:
* **Subtle Card Drop Shadow:**
  - Color: `Color(0x0A0E3039)` (4% to 6% opacity of `primaryTeal`)
  - Blur Radius: `8.0px`
  - Offset: `Offset(0, 2)`
  - Spread: `0.0px`
* **Modal Sheet Elevation:**
  - Color: `Color(0x260E3039)` (15% opacity)
  - Blur Radius: `16.0px`
  - Offset: `Offset(0, -4)`
* **Active CTA Glow (Button Hover/Active):**
  - Color: `Color(0x3337B1A7)` (20% opacity of `accentTurquoise`)
  - Blur Radius: `10.0px`
  - Offset: `Offset(0, 4)`

---

## 4. Brand Mascot Illustration Assets (Otis)

The application centers around **Otis the Mascot** across 6 verified illustration states present in the workspace:

| Asset File | Name & Context | Visual Theme | Exact Placement in Screens |
|---|---|---|---|
| `01_otis_book.png` | **Otis Reading / Ledger** | Otis holding a financial ledger book with eyeglasses | `Group 4` (Onboarding Intro Screen), Educational tips |
| `02_otis_tux.png` | **Otis in Tuxedo** | Otis wearing an emerald bow tie & tuxedo jacket | `Group 3` (Budget Setup Screen), Premium tier profile |
| `03_otis_money.png` | **Otis with Cash** | Otis holding cash banknotes | `first-funding-prompt 1`, Top-Up Success, Quick Spend confirmation |
| `04_otis_safe.png` | **Otis at the Vault** | Otis leaning on a heavy titanium bank vault / lock | `save-home 1` (Savings Hub Main), Period & Year lock screens |
| `05_otis_confetti.png` | **Otis Celebrating** | Otis cheering with party hat and colorful confetti | `save-goal-success 1`, Budget Recap 100% goal achieved |
| `06_otis_sad.png` | **Otis Apologetic / Sad** | Otis with droopy ears and an empty wallet | `activity-detail-failed 1`, Failure modals, Offline warning |

---

## 5. Reusable Component Inventory (Target Design Library)

The following 14 core components must be implemented as standalone, testable widgets in Phase 2:

1. **`AppButton`**:
   - Variants: Primary (`primaryTeal` or `accentTurquoise`), Secondary Outline (`borderLight`), Destructive (`dangerRed`), Ghost Text.
   - States: Idle, Pressed, Loading (spinner), Disabled. Height: 50px, Radius: 14px.
2. **`AllowanceHeroCard`**:
   - Hero card with dark teal background, dynamic today's allowance, time remaining pill, and inline Quick Spend button.
3. **`TotalBalanceCard`**:
   - Secondary card showing total balance in LockBudget, interest earned, and Top-up shortcut.
4. **`QuickSpendCategoryTile`**:
   - Category icon circle, category name, remaining allocation pill, and fast spend trigger.
5. **`TransactionListTile`**:
   - Icon with category tint, title, subtitle with timestamp, signed currency amount (`+₦` green / `-₦` dark teal), status badge.
6. **`StatusBadge`**:
   - Compact pill for `DONE` (green), `PENDING` (amber), `FAILED` (red), `SYNC DELAYED` (gray).
7. **`CurrencyInputField`**:
   - Large formatted currency input with fixed prefix `₦`, automatic comma grouping, clear button, and numeric keypad integration.
8. **`OtisAvatar`**:
   - Circular mascot avatar with online status dot and tier indicator ring.
9. **`CustomAppBar`**:
   - Transparent elevation-zero header with Otis brand logo, profile shortcut, and notification bell with badge.
10. **`CustomNavBar`**:
    - 4-tab bottom navigation (Home, Save, Budget, Activity) with custom active pill indicators and micro-animations.
11. **`GoalProgressCard`**:
    - Savings goal card with title, target amount, current locked balance, radial or horizontal progress bar, and days to unlock.
12. **`ModalBottomSheetShell`**:
    - Reusable drag-handle bottom sheet wrapper with rounded top corners (24px) and smooth dismissal.
13. **`LockConfirmationSlider` / Checkbox**:
    - High-intent confirmation widget for locking budgets or emergency unlocks.
14. **`OfflineNotificationBanner`**:
    - Top-pinned alert bar showing offline status and queued sync count.
