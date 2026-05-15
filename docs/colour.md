Requirements: Color Palette & Theme System for Anozon
Project: Anozon (E-commerce Platform)
Version: 1.0
Target Audience:

3. User Portal — Luxury / Premium
Emotional goal: Refined sophistication, aspirational calm, trust without loudness.
themes/user/light.css
css:root[data-theme="user"] {
  --brand-primary:        #2C2C2A;
  --brand-accent:         #BA7517;
  --brand-surface:        #F1EFE8;
  --brand-surface-alt:    #E8E6DE;
  --brand-border:         #B4B2A9;
  --brand-text-primary:   #2C2C2A;
  --brand-text-secondary: #5F5E5A;
  --brand-cta:            #BA7517;
  --brand-cta-fg:         #F1EFE8;
  --brand-destructive:    #A32D2D;
}
themes/user/dark.css
css:root[data-theme="user"].dark {
  --brand-primary:        #D3D1C7;
  --brand-accent:         #EF9F27;
  --brand-surface:        #1A1A18;
  --brand-surface-alt:    #252522;
  --brand-border:         #444441;
  --brand-text-primary:   #F1EFE8;
  --brand-text-secondary: #B4B2A9;
  --brand-cta:            #EF9F27;
  --brand-cta-fg:         #2C2C2A;
  --brand-destructive:    #F09595;
}
themes/user/components.css
css/* Serif headings for luxury feel */
[data-theme="user"] .page-heading {
  font-family: var(--font-serif), Georgia, serif;
  font-weight: 400;
  letter-spacing: -0.01em;
}

/* Restrained CTA — wide tracking, small caps feel */
[data-theme="user"] .btn-primary {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.72rem;
  border-radius: 2px;
}

/* Square-ish cards — premium, not bubbly */
[data-theme="user"] .card,
[data-theme="user"] .card-alt {
  border-radius: 4px;
}

/* Thin gold focus ring */
[data-theme="user"] .input-base:focus {
  box-shadow: 0 0 0 1px #BA7517;
}

4. Seller Portal — AI / Creative Tools
Emotional goal: Intelligent capability, creative energy, modern confidence.
themes/seller/light.css
css:root[data-theme="seller"] {
  --brand-primary:        #26215C;
  --brand-accent:         #7F77DD;
  --brand-surface:        #EEEDFE;
  --brand-surface-alt:    #E2E0FA;
  --brand-border:         #AFA9EC;
  --brand-text-primary:   #26215C;
  --brand-text-secondary: #534AB7;
  --brand-cta:            #534AB7;
  --brand-cta-fg:         #FFFFFF;
  --brand-teal:           #1D9E75;
  --brand-destructive:    #A32D2D;
}
themes/seller/dark.css
css:root[data-theme="seller"].dark {
  --brand-primary:        #CECBF6;
  --brand-accent:         #AFA9EC;
  --brand-surface:        #16142E;
  --brand-surface-alt:    #1E1B3A;
  --brand-border:         #3C3489;
  --brand-text-primary:   #EEEDFE;
  --brand-text-secondary: #AFA9EC;
  --brand-cta:            #7F77DD;
  --brand-cta-fg:         #EEEDFE;
  --brand-teal:           #5DCAA5;
  --brand-destructive:    #F09595;
}
themes/seller/components.css
css/* Sidebar uses deep brand primary as background */
[data-theme="seller"] .sidebar {
  background-color: var(--brand-primary);
  border-right: 1px solid var(--brand-border);
}
[data-theme="seller"] .sidebar .nav-item {
  color: var(--brand-surface);
  opacity: 0.75;
}
[data-theme="seller"] .sidebar .nav-item.active,
[data-theme="seller"] .sidebar .nav-item:hover {
  opacity: 1;
  background-color: color-mix(in srgb, var(--brand-accent) 15%, transparent);
}

/* Teal for success/revenue states in charts */
[data-theme="seller"] .stat-positive {
  color: var(--brand-teal);
}

/* Rounded buttons — creative tools feel */
[data-theme="seller"] .btn-primary {
  border-radius: 8px;
}

5. Admin Portal — Alert / Authority
Emotional goal: Control, decisive action, nothing ambiguous — every interaction feels weighted.
themes/admin/light.css
css:root[data-theme="admin"] {
  --brand-primary:        #591515ff;
  --brand-accent:         #E24B4A;
  --brand-surface:        #FFFFFF;
  --brand-surface-alt:    #FCEBEB;
  --brand-border:         #F7C1C1;
  --brand-text-primary:   #2C2C2A;
  --brand-text-secondary: #5F5E5A;
  --brand-cta:            #A32D2D;
  --brand-cta-fg:         #FFFFFF;
  --brand-destructive:    #791F1F;
  --brand-warning:        #BA7517;
}
themes/admin/dark.css
css:root[data-theme="admin"].dark {
  --brand-primary:        #F7C1C1;
  --brand-accent:         #F09595;
  --brand-surface:        #1A0E0E;
  --brand-surface-alt:    #2A1414;
  --brand-border:         #791F1F;
  --brand-text-primary:   #F1EFE8;
  --brand-text-secondary: #B4B2A9;
  --brand-cta:            #E24B4A;
  --brand-cta-fg:         #FFFFFF;
  --brand-destructive:    #F09595;
  --brand-warning:        #EF9F27;
}
themes/admin/components.css
css/* Table row highlight using brand-surface-alt for red identity */
[data-theme="admin"] table tr:hover td {
  background-color: var(--brand-surface-alt);
}

/* Warning badge — amber for pending states */
[data-theme="admin"] .badge-warning {
  background-color: var(--brand-warning);
  color: #fff;
}

/* Destructive actions are visually prominent */
[data-theme="admin"] .btn-destructive {
  background-color: var(--brand-destructive);
  letter-spacing: 0.04em;
  font-weight: 600;
}

/* Tighter headings — crisp authority */
[data-theme="admin"] .page-heading {
  letter-spacing: -0.02em;
  font-weight: 700;
}

6. How to Wire in Next.js
In your root layout (app/layout.tsx)
tsximport '@/styles/globals.css'
import '@/styles/themes/user/light.css'
import '@/styles/themes/user/dark.css'
import '@/styles/themes/user/components.css'
import '@/styles/themes/seller/light.css'
import '@/styles/themes/seller/dark.css'
import '@/styles/themes/seller/components.css'
import '@/styles/themes/admin/light.css'
import '@/styles/themes/admin/dark.css'
import '@/styles/themes/admin/components.css'
Setting the theme on <html>
tsx// Determine portal from session/middleware and pass as prop
<html
  data-theme={portal}       // "user" | "seller" | "admin"
  className={isDark ? 'dark' : ''}
>
Middleware — set portal from route or session
ts// middleware.ts
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  let portal = 'user'
  if (pathname.startsWith('/seller')) portal = 'seller'
  if (pathname.startsWith('/admin'))  portal = 'admin'
  // pass portal to layout via header or cookie
}
shadcn/ui — override CSS variables to follow brand tokens
In globals.css, after Tailwind directives, remap shadcn's --primary, --background etc. so shadcn components automatically pick up the portal theme:
css:root {
  --background:   var(--brand-surface);
  --foreground:   var(--brand-text-primary);
  --primary:      var(--brand-cta);
  --primary-foreground: var(--brand-cta-fg);
  --border:       var(--brand-border);
  --ring:         var(--brand-accent);
  --muted:        var(--brand-surface-alt);
  --muted-foreground: var(--brand-text-secondary);
  --destructive:  var(--brand-destructive);
}
This means every shadcn <Button>, <Card>, <Input> will automatically use whichever portal theme is active — no extra wiring needed per component.

Acceptance Criteria

Switching data-theme on <html> changes the entire portal palette with no page reload
Dark mode toggled by adding .dark to <html> — works independently per portal
base.css has zero hardcoded colour values — only var(--brand-*) references
No User portal styles appear in Seller or Admin routes (verify via browser devtools)
shadcn/ui components (Button, Card, Input, Badge) visually match each portal's palette without custom className overrides
All three portals pass WCAG AA contrast ratio on text against their surface colours

