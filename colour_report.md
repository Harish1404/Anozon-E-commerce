# Anozon E-Commerce Color Palette Structure & Theming Guide

This document outlines the architecture, color palettes, and development best practices for the multi-portal theming engine used in the Anozon platform.

---

## 1. Architectural Logic Level

The frontend utilizes a robust, semantic theming system designed to support multiple actors (User, Seller, Admin) while seamlessly supporting both Light and Dark modes. 

The logic is split into three layers:
1. **Brand Tokens (`--brand-*`)**: Defined per actor and per mode (light/dark).
2. **Semantic Variables (`--background`, `--primary`, etc.)**: Mapped directly to the Brand Tokens in `globals.css`.
3. **Tailwind Classes (`bg-background`, `text-primary`)**: Used by components to consume the Semantic Variables.

### How it works:
The root `<html>` tag manages the theme state using two attributes:
*   `data-theme="user" | "seller" | "admin"`: Determines the active brand palette.
*   `class="dark"` (optional): Determines if the dark mode overrides should be applied.

---

## 2. Color Palettes by Actor

Each actor has a distinct brand identity defined in `frontend/styles/themes/<actor>/`.

### A. User Portal (Gold / Earthy)
**Vibe:** Premium, accessible, shopping-focused.
*   **Primary/CTA:** Gold / Amber (`#BA7517` light, `#EF9F27` dark)
*   **Surface:** Warm off-white (`#F1EFE8`) / Deep Charcoal (`#1A1A18`)
*   **Files:**
    *   `styles/themes/user/light.css`
    *   `styles/themes/user/dark.css`

### B. Seller Portal (Purple / Indigo)
**Vibe:** Professional, analytical, dashboard-focused.
*   **Primary/CTA:** Deep Purple (`#534AB7` light, `#7F77DD` dark)
*   **Surface:** Soft Lavender (`#EEEDFE`) / Deep Night (`#16142E`)
*   **Files:**
    *   `styles/themes/seller/light.css`
    *   `styles/themes/seller/dark.css`

### C. Admin Portal (Red / Crimson)
**Vibe:** Authoritative, high-contrast, management-focused.
*   **Primary/CTA:** Crimson Red (`#A32D2D` light, `#E24B4A` dark)
*   **Surface:** Pure White (`#FFFFFF`) / Deep Maroon-Black (`#1A0E0E`)
*   **Files:**
    *   `styles/themes/admin/light.css`
    *   `styles/themes/admin/dark.css`

---

## 3. How to Safely Change Component Colors

To ensure the multi-portal and dark mode features do not break, **you must strictly use Semantic Tailwind Variables** instead of hardcoded colors.

### The Golden Rule
❌ **Never do this:** `className="bg-white text-slate-900 border-gray-200"`
✅ **Always do this:** `className="bg-card text-foreground border-border"`

### Mapping Guide for Components
When building or modifying UI components, map your design intent to these variables:

| Design Intent | Tailwind Class to Use | Underlying CSS Variable |
| :--- | :--- | :--- |
| Page Background | `bg-background` | `--background` |
| Component Surface (Cards, Modals) | `bg-card` | `--card` |
| Main Text / Headings | `text-foreground` | `--foreground` |
| Secondary Text / Subtitles | `text-muted-foreground` | `--muted-foreground` |
| Borders / Dividers | `border-border` | `--border` |
| Call to Action Button | `bg-primary text-primary-foreground` | `--primary` |
| Subtle Highlights / Hover states | `bg-muted` | `--muted` |
| Error / Delete Actions | `bg-destructive` | `--destructive` |

### How to Modify the Theme Itself
If you want to change the actual "Gold" color to a different shade, **do not change the components**. 

Instead, modify the Brand Tokens in the CSS files:
1. Open `styles/themes/user/light.css`
2. Change `--brand-cta: #BA7517;` to your new color.
3. Open `styles/themes/user/dark.css`
4. Change `--brand-cta: #EF9F27;` to the dark-mode equivalent of your new color.

By doing this, *every* component using `bg-primary` or `text-primary` will automatically inherit the new color without breaking dark mode logic.
