# UI/UX Specification - E-Commerce Web Application

## Design System

### Color Palette
```css
:root {
  /* Primary */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-900: #1e3a8a;

  /* Secondary */
  --color-secondary-50: #f8fafc;
  --color-secondary-100: #f1f5f9;
  --color-secondary-500: #64748b;
  --color-secondary-600: #475569;
  --color-secondary-900: #0f172a;

  /* Semantic */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Neutral */
  --color-white: #ffffff;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
}
```

### Typography
```css
:root {
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --font-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

### Spacing & Layout
```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  --container-max: 1280px;
  --header-height: 72px;
  --footer-height: auto;

  --border-radius-sm: 0.25rem;  /* 4px */
  --border-radius-md: 0.5rem;   /* 8px */
  --border-radius-lg: 0.75rem;  /* 12px */
  --border-radius-xl: 1rem;     /* 16px */
  --border-radius-full: 9999px;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

### Breakpoints
```css
:root {
  --breakpoint-sm: 640px;   /* Mobile landscape */
  --breakpoint-md: 768px;   /* Tablet */
  --breakpoint-lg: 1024px;  /* Desktop */
  --breakpoint-xl: 1280px;  /* Large desktop */
  --breakpoint-2xl: 1536px; /* Extra large */
}
```

---

## Page Specifications

### 1. Home Page (`/`)

#### Wireframe Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Logo | Nav (Categories, Deals, New) | Search | Cart │
├─────────────────────────────────────────────────────────────┤
│ Hero Section: Headline | Subtext | CTA | Background Image  │
├─────────────────────────────────────────────────────────────┤
│ Trust Bar: Shipping | Returns | Support | Secure Payment   │
├─────────────────────────────────────────────────────────────┤
│ Category Grid: 4-6 Category Cards with Images              │
├─────────────────────────────────────────────────────────────┤
│ Featured Products: Carousel (Auto-slide, Manual Nav)       │
├─────────────────────────────────────────────────────────────┤
│ Promotional Banner: Seasonal Campaign                       │
├─────────────────────────────────────────────────────────────┤
│ New Arrivals: Product Grid (8 products) | View All Link    │
├─────────────────────────────────────────────────────────────┤
│ Newsletter Signup: Email Input | Submit | Privacy Note     │
├─────────────────────────────────────────────────────────────┤
│ Footer: Links | Social | Legal | Payment Methods           │
└─────────────────────────────────────────────────────────────┘
```

#### Component Specifications

**Header**
- Height: 72px (desktop), 60px (mobile)
- Sticky on scroll
- Logo: SVG, 32x32px, links to home
- Navigation: Horizontal, hover dropdown for categories
- Search: Expandable on focus, autocomplete suggestions
- Cart: Icon with badge count, dropdown preview on hover
- User menu: Avatar, dropdown (Profile, Orders, Settings, Logout)

**Hero Section**
- Height: 500px (desktop), 350px (mobile)
- Background: Responsive image (WebP/AVIF), lazy loaded
- Content: H1 (48px), Subtitle (20px), Primary CTA (16px)
- CTA: "Shop Now" → `/products?sort=newest`
- Accessibility: Alt text, sufficient contrast, focus visible

**Category Grid**
- 4 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Card: Image (16:9), Name, Product Count, Chevron
- Hover: Image scale(1.05), overlay darken
- Link to `/products?category={slug}`

**Product Carousel**
- 5 products visible (desktop), 2.5 (tablet), 1.2 (mobile)
- Auto-slide: 5s interval, pause on hover
- Navigation: Prev/Next arrows, dot indicators
- Keyboard: Arrow keys, Home/End
- Product Card: Image, Name, Price, Rating, Quick Add

**Trust Bar**
- 4 icons with labels
- Free Shipping > $50, 30-Day Returns, 24/7 Support, Secure Checkout

---

### 2. Product Listing Page (`/products`)

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header (same as home)                                       │
├──────────────┬──────────────────────────────────────────────┤
│ Sidebar      │ Main Content                                  │
│ (280px)      │                                              │
│              │ [Breadcrumb] [Toolbar: Sort | View | Filter] │
│ Filters:     │                                              │
│ - Categories │ Product Grid (20 per page)                   │
│ - Price      │                                              │
│ - Brand      │ [Pagination: Prev 1 2 3 ... 10 Next]         │
│ - Rating     │                                              │
│ - Availability│                                             │
│              │                                              │
│ [Clear All]  │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

#### Toolbar
- Sort: Select (Popularity, Price Low-High, Price High-Low, Newest, Rating)
- View: Toggle (Grid 4-col, Grid 3-col, List)
- Filter: Button (opens sidebar on mobile, shows active count)
- Results: "Showing 1-20 of 1,234 products"

#### Product Grid Card
```
┌─────────────────────────┐
│   [Product Image]       │  ← 1:1 aspect, lazy load
│   [Badge: Sale/New]     │  ← Top-left overlay
│   [Wishlist Icon]       │  ← Top-right, toggle
├─────────────────────────┤
│ Product Name (2 lines)  │  ← Truncate with ellipsis
│ Brand Name              │  ← Muted, smaller
│ ★★★★☆ (4.5) 123 reviews │
│ $29.99  ~~$39.99~~      │  ← Strike-through for sale
│ [Quick Add to Cart]     │  ← Secondary button
└─────────────────────────┘
```

#### Sidebar Filters
- Accordion sections (open by default on desktop)
- Category: Tree with checkboxes, counts
- Price: Dual range slider + inputs
- Brand: Searchable multi-select
- Rating: Star checkboxes (4+, 3+, etc.)
- Availability: In Stock Only checkbox
- Applied filters: Chips with remove X
- Clear All link

#### Mobile Filter
- Bottom sheet modal
- Full-screen on < 480px
- Apply button sticky at bottom

---

### 3. Product Detail Page (`/products/:id`)

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
├──────────────────────────┬──────────────────────────────────┤
│                          │ Product Info                      │
│   Image Gallery          │ [Breadcrumb]                     │
│   (Main: 600x600)        │ Brand | Product Name             │
│                          │ ★★★★★ 123 reviews | In Stock     │
│   Thumbnails (5)         │ $XX.XX                           │
│                          │ [Variant Selectors: Size, Color] │
│                          │ [Quantity: - [1] +]              │
│                          │ [Add to Cart - Primary]          │
│                          │ [Buy Now - Secondary]            │
│                          │ [Wishlist] [Share]               │
│                          │ Shipping Info | Returns Policy   │
├──────────────────────────┼──────────────────────────────────┤
│                          │ Tabs: Details | Specs | Reviews  │
│                          │                                  │
│                          │ Details: Description (Rich Text) │
│                          │ Specs: Table (Key | Value)       │
│                          │ Reviews: List + Write Review     │
├──────────────────────────┴──────────────────────────────────┤
│ Related Products: Carousel (4 items)                        │
└─────────────────────────────────────────────────────────────┘
```

#### Image Gallery
- Main image: Zoom on hover (desktop), pinch zoom (mobile)
- Thumbnails: Horizontal scroll, active border
- Keyboard: Arrow keys navigate, Escape closes zoom
- Swipe gestures on mobile
- Full-screen modal on click (desktop)

#### Variant Selectors
- Size: Button group (XS, S, M, L, XL) - disabled if OOS
- Color: Swatches with tooltip, selected ring
- Dynamic price update if variant has different price
- Stock indicator per variant combination

#### Add to Cart
- Primary button, full width on mobile
- Loading state with spinner
- Success toast with "View Cart" / "Continue Shopping"
- Updates cart count in header
- Analytics event: `add_to_cart` with product data

#### Tabs
- Default: Details
- Deep linkable: `/products/:id#reviews`
- Reviews: Paginated (10/page), sort (Newest, Highest, Lowest, Helpful)
- Write Review: Modal (requires login), rating, title, body, photos

---

### 4. Shopping Cart (`/cart`)

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
├─────────────────────────────────────────────────────────────┤
│ [← Continue Shopping]  Shopping Cart (3 items)             │
├─────────────────────────────────────────────────────────────┤
│ Cart Items                          │ Order Summary         │
│                                     │ (Sticky, 320px)       │
│ ┌─────────────────────────────────┐ │                       │
│ │ [Img] Product Name              │ │ Subtotal      $XX.XX  │
│ │      Variant: Red / M           │ │ Discount      -$X.XX  │
│ │      $XX.XX  [-] 2 [+] [Remove] │ │ Shipping       $X.XX  │
│ └─────────────────────────────────┘ │ Tax            $X.XX  │
│                                     │ ──────────────────    │
│ ┌─────────────────────────────────┐ │ Total         $XX.XX  │
│ │ [Img] Another Product           │ │                       │
│ │      $XX.XX  [-] 1 [+] [Remove] │ │ [Promo Code Input]    │
│ └─────────────────────────────────┘ │ [Apply]               │
│                                     │ [Checkout - Primary]  │
│ [← Continue Shopping]               │ Secure checkout note  │
└─────────────────────────────────────┴───────────────────────┘
```

#### Cart Item
- Image: 80x80px, link to product
- Name: Link to product, variant details below
- Price: Unit price
- Quantity: Input with min/max (1-99), +/- buttons
- Remove: Trash icon, confirmation toast with undo (5s)
- Line total: quantity × unit price

#### Order Summary
- Sticky on scroll (desktop)
- Promo code: Input + apply button, shows success/error
- Shipping: Calculated based on address (shows estimate for guest)
- Free shipping progress bar: "Add $XX more for free shipping"
- Checkout: Primary button, disabled if cart empty/invalid
- Security badges: SSL, PCI, Payment icons

#### Empty Cart
- Illustration, "Your cart is empty"
- "Continue Shopping" button
- Suggested products (recently viewed, popular)

---

### 5. Checkout Flow (`/checkout`)

#### Step Indicator
```
Step 1: Shipping    →    Step 2: Delivery    →    Step 3: Payment    →    Step 4: Review
   ✓                     ○                       ○                       ○
```

#### Step 1: Shipping Address
- Address form: First Name, Last Name, Company, Address 1, Address 2, City, State, Zip, Country, Phone
- Saved addresses: Radio cards (default selected)
- "Add New Address" expands form
- Validation: Real-time, inline errors
- "Save as default" checkbox
- Continue button: Validates required fields

#### Step 2: Shipping Method
- Options: Standard (3-5 days, $5.99), Express (1-2 days, $14.99), Pickup (Free)
- Radio cards with delivery estimate
- Free shipping threshold notice
- Continue button

#### Step 3: Payment
- Tabs: Credit Card, PayPal, Apple Pay, Google Pay, Saved Methods
- Credit Card: Stripe Elements (secure iframe)
  - Card number, Expiry, CVC, Postal Code
  - Real-time validation, card brand detection
- PayPal: Redirect button
- Saved cards: Last 4, brand, expiry, set as default
- Continue button: Validates payment

#### Step 4: Review & Confirm
- Collapsible sections: Shipping, Delivery, Payment, Items
- Edit links per section (navigate back)
- Terms checkbox (required)
- Place Order: Primary button, loading state
- Order summary with final total

#### Success Page (`/checkout/success/:orderId`)
- Order number, confirmation email sent
- Order details summary
- Estimated delivery date
- "Track Order" button
- "Continue Shopping" button
- Social sharing

---

### 6. User Account Pages

#### Login/Register (`/auth/login`, `/auth/register`)
- Split layout: Form (480px max) | Branding
- Social login: Google, Apple, Facebook
- Form: Email, Password, [Name for register]
- Password requirements shown inline
- "Show password" toggle
- Forgot password link
- Terms/Privacy links
- Error: Generic message, inline field errors

#### Profile (`/account`)
- Tabs: Profile, Addresses, Payment Methods, Orders, Preferences, Security
- Profile: Name, Email (verified badge), Avatar upload, Email change flow
- Addresses: List with Default badges, Add/Edit/Delete/Set Default
- Payment Methods: List with Last 4, Brand, Expiry, Set Default, Remove
- Orders: Same as Order History page
- Preferences: Newsletter, SMS, Push notifications toggles
- Security: Change password, 2FA setup (TOTP), Active sessions, Delete account

#### Order History (`/account/orders`)
- Filter tabs: All, Pending, Processing, Shipped, Delivered, Cancelled, Refunded
- Table: Order #, Date, Status, Items, Total, Actions
- Actions: View, Reorder, Cancel, Download Invoice
- Pagination, empty state

#### Order Detail (`/account/orders/:id`)
- Status timeline: Order Placed → Confirmed → Processing → Shipped → Delivered
- Shipping/Billing addresses
- Items with images, quantities, prices
- Payment info (masked)
- Tracking number + carrier link (if shipped)
- Cancel button (if eligible)
- Return/Refund button (if delivered)
- Download Invoice (PDF)

---

### 7. Admin Dashboard (`/admin`)

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Top Bar: Logo | Search | Notifications | User Menu         │
├──────────────┬──────────────────────────────────────────────┤
│ Sidebar      │ Main Content                                  │
│ (260px)      │                                              │
│ Dashboard    │ [Page Header: Title | Actions]               │
│ Products     │                                              │
│   List       │ Content Area (Tables, Forms, Charts)         │
│   Categories │                                              │
│   Brands     │                                              │
│ Orders       │                                              │
│ Users        │                                              │
│ Settings     │                                              │
│              │                                              │
│ [Collapse]   │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

#### Product Management
- Table: Image, Name, SKU, Category, Brand, Price, Stock, Status, Actions
- Bulk actions: Publish, Unpublish, Delete, Export CSV
- Filters: Category, Brand, Status, Stock, Date range
- Create/Edit: Multi-step form (Basic, Variants, Images, SEO, Inventory)
- Image upload: Drag-drop, multiple, reorder, alt text
- Variants: Dynamic attribute matrix (Size × Color)

#### Order Management
- Table: Order #, Customer, Date, Status, Total, Payment, Actions
- Status workflow: Pending → Confirmed → Processing → Shipped → Delivered
- Detail: Timeline, Customer info, Items, Addresses, Payment, Notes
- Actions: Update status, Print packing slip, Refund, Export

---

## Responsive Behavior

### Breakpoint-Specific Adjustments

| Component | Desktop (≥1024px) | Tablet (768-1023px) | Mobile (<768px) |
|-----------|-------------------|---------------------|-----------------|
| Header | Full nav, search expanded | Hamburger menu, search icon | Hamburger, search modal |
| Product Grid | 4 columns | 3 columns | 2 columns (1 on <480) |
| Product Detail | Side-by-side gallery/info | Stacked, gallery top | Stacked, gallery top |
| Cart | Two-column layout | Two-column (summary sticky) | Single column, summary top |
| Checkout | Two-column (form + summary) | Single column | Single column |
| Admin | Sidebar + content | Collapsible sidebar | Drawer sidebar |

### Touch Targets
- Minimum 44×44px for all interactive elements
- 8px minimum spacing between touch targets
- Hover states have active/touch equivalents

---

## Accessibility Requirements (WCAG 2.1 AA)

### Keyboard Navigation
- All interactive elements reachable via Tab
- Logical tab order (left-to-right, top-to-bottom)
- Visible focus indicator: 2px solid --color-primary-500, offset 2px
- Skip link: "Skip to main content" (first focusable element)
- Focus trap in modals/drawers
- Escape closes modals/drawers

### Screen Reader Support
- Semantic HTML: header, nav, main, aside, footer, section, article
- Heading hierarchy: h1 (page title) → h2 (sections) → h3 (subsections)
- ARIA labels on icon-only buttons
- Live regions for: cart count, toast notifications, filter results
- Alt text: Descriptive for product images, empty for decorative
- Form labels: Explicit `<label for>` or `aria-label`
- Error messages: `aria-describedby` linking to error text
- Status: `aria-live="polite"` for loading, `aria-live="assertive"` for errors

### Color & Contrast
- Text: 4.5:1 minimum (AA), 7:1 for large text (AAA)
- UI components: 3:1 minimum (borders, icons, focus)
- Color not sole indicator: Icons + text for status (error, success)
- Focus indicator: 3:1 against adjacent colors

### Responsive Text
- Base: 16px (1rem)
- Scales with viewport: clamp(1rem, 0.9rem + 0.5vw, 1.125rem)
- User can zoom to 200% without horizontal scroll
- Relative units (rem, em) throughout

---

## Component Library

### Buttons
```typescript
// Variants
primary: bg-primary-600 text-white hover:bg-primary-700
secondary: bg-gray-100 text-gray-900 hover:bg-gray-200
outline: border border-gray-300 text-gray-700 hover:bg-gray-50
ghost: text-gray-600 hover:bg-gray-100
danger: bg-error text-white hover:bg-error-dark
link: text-primary-600 hover:underline

// Sizes
sm: px-3 py-1.5 text-sm
md: px-4 py-2 text-base
lg: px-6 py-3 text-lg
xl: px-8 py-4 text-xl

// States
disabled: opacity-50 cursor-not-allowed
loading: spinner + disabled
full-width: w-full
```

### Form Inputs
```typescript
// Text Input
label (required) → input → error message
States: default, focus, error, disabled, readonly

// Select
Native select with custom styling
Searchable for >10 options (combobox)

// Checkbox/Radio
Custom styled, 20x20px
Group: fieldset + legend

// Toggle Switch
44x24px, animated thumb
aria-checked, role="switch"
```

### Cards
```typescript
// Product Card
border border-gray-200 rounded-lg overflow-hidden
hover: shadow-lg transition-shadow

// Feature Card
bg-white p-6 rounded-xl border border-gray-100
```

### Modals/Drawers
- Backdrop: bg-black/50, blur-sm
- Panel: max-h-[90vh] overflow-auto
- Focus trap, Escape to close
- Mobile: bottom sheet (drawer), desktop: centered modal

### Toasts
- Position: top-right (desktop), bottom (mobile)
- Types: success (green), error (red), warning (yellow), info (blue)
- Auto-dismiss: 5s (success/info), persistent (error)
- Action button: "Undo", "Retry", "Dismiss"

---

## Animation & Transitions

### Timing
```css
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;

--ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Animations
- Fade: opacity 0→1 (150ms)
- Slide: transform translateY (250ms)
- Scale: transform scale (200ms) for hover/tap
- Spinner: rotate 1s linear infinite
- Skeleton: pulse 1.5s ease-in-out infinite

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Performance Budgets

### Core Web Vitals Targets
| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP | < 2.5s | 75th percentile |
| INP | < 200ms | 75th percentile |
| CLS | < 0.1 | 75th percentile |
| TTFB | < 600ms | 75th percentile |
| FCP | < 1.8s | 75th percentile |

### Resource Budgets (per page)
| Resource | Budget |
|----------|--------|
| Total JS | < 170 KB gzipped |
| Total CSS | < 50 KB gzipped |
| Fonts | < 100 KB (woff2, subset) |
| Images | WebP/AVIF, responsive, lazy |
| Third-party | < 50 KB, async/defer |

### Optimization Strategies
- Code splitting: Route-based + component-based
- Preload: Critical CSS, hero image, key fonts
- Prefetch: Next page on hover (IntersectionObserver)
- Service Worker: Cache-first for static, network-first for API
- Image optimization: Next/Image or Cloudflare Images
- Bundle analysis: webpack-bundle-analyzer in CI

---

## Browser Support

### Supported Browsers
- Chrome: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions (macOS + iOS)
- Edge: Latest 2 versions
- Samsung Internet: Latest

### Progressive Enhancement
- Core functionality works without JS (forms, links)
- JS enhances: Interactivity, validation, optimistic UI
- Feature detection for: WebP, AVIF, IntersectionObserver, CSS Grid

---

## Internationalization (i18n)

### Supported Locales
- en-US (default)
- es-ES
- fr-FR
- de-DE
- zh-CN
- ja-JP

### Implementation
- Routing: `/en/`, `/es/`, etc.
- Translation keys: JSON files per locale
- RTL support: Arabic, Hebrew (future)
- Currency: Locale-aware formatting
- Date/Number: Intl API
- Pluralization: ICU MessageFormat

---

## Testing Checkpoints

### Visual Regression
- All pages at 3 breakpoints
- All component states (hover, focus, active, disabled, loading, error)
- Dark mode (if implemented)
- High contrast mode

### Cross-Browser
- Chrome, Firefox, Safari, Edge
- iOS Safari, Chrome Android
- Keyboard-only navigation
- Screen reader: NVDA, VoiceOver, JAWS

### Performance
- Lighthouse CI on every PR
- WebPageTest on release
- RUM monitoring in production

---

## Design Tokens Export

### Figma/Design System Sync
- Colors, spacing, typography, shadows, radii as design tokens
- Format: Style Dictionary (JSON) → CSS vars, iOS, Android
- Versioned with semantic versioning
- CI: Token changes → PR to design system repo

---

## Handoff Checklist

- [ ] All pages designed in Figma with auto-layout
- [ ] Components documented with props/states
- [ ] Design tokens exported and versioned
- [ ] Accessibility annotations on designs
- [ ] Responsive variants for all breakpoints
- [ ] Interaction specs (hover, focus, loading, error)
- [ ] Animation specs with easing/duration
- [ ] Content guidelines (copy, truncation, empty states)
- [ ] Asset export specs (formats, sizes, naming)
- [ ] Developer handoff meeting scheduled