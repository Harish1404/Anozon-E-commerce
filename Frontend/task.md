User Story: Brand Logo Integration — Navbar & Auth Pages
As a user visiting the Anozon platform,
I want to see the Anozon brand logo consistently across the navbar and authentication pages, and the correct icon on the browser tab,
So that the product feels polished, trustworthy, and on-brand from the first interaction.
REMOVE THE TEXT Anozon and then add the svg instead of it in navbar and auth page.

Acceptance Criteria
Navbar

The Anozon.svg wordmark logo must appear on the top-left of the navbar
Logo height must be 32px, width auto-scaled to maintain aspect ratio
Logo must be wrapped in an anchor tag linking to the home page /
Logo must be visible and properly aligned on both desktop and mobile viewports
On mobile, the logo must not overflow or get clipped

Login Page

The Anozon.svg logo must appear centered at the top of the login card, above the heading
Logo height must be 36px, width auto
Below the logo, a subtitle text "Commerce platform" (or product tagline) must appear in muted style
The card must be centered on the page both horizontally and vertically

Sign Up Page

Same logo placement and sizing rules as the Login page apply
Logo and tagline must appear identically to maintain visual consistency across auth flows

Browser Tab (Favicon)

The logo.svg file must be set as the favicon using the SVG format in the <head>
Fallback .ico or .png favicon should be provided for browsers that don't support SVG favicons
The tab title must read Anozon or Anozon — [Page Name] depending on the active page


Assets
FileUsageLocationAnozon.svgNavbar logo + Auth page logo/public/assets/Anozon.svglogo.svgBrowser tab favicon/public/assets/logo.svg

Technical Notes for Dev

Both SVG files were converted from PNG via background removal — the first <path> in each file contains a background fill (#F2F2F0 / #EDEDEA). This may cause the logo to appear with a light box on colored backgrounds. Dev should either remove the background path from the SVG or apply mix-blend-mode: multiply as a CSS workaround depending on the background color of the placement context.
Do not hardcode pixel widths on the logo — use height only and let width: auto handle scaling to avoid distortion.
Logo alt text must be "Anozon" for accessibility.
Favicon tag to place in <head>:

html  <link rel="icon" type="image/svg+xml" href="/assets/logo.svg">
  <link rel="icon" type="image/png" href="/assets/logo.png" sizes="32x32">

Out of Scope

Dark mode logo variant (separate story if needed)
Animated logo or loading state
Logo on email templates


Definition of Done

 Logo renders correctly in Chrome, Firefox, Safari, Edge
 Favicon appears in browser tab on all major browsers
 No layout breakage on mobile (375px) or tablet (768px)
 Logo SVG background path removed or visually handled
 Reviewed and approved by design before merge