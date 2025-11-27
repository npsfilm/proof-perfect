# Design System & Style Guide

## Overview

This document outlines the complete design system and CSS architecture for the photo gallery proofing application. The design uses a semantic token-based approach with HSL colors for maximum flexibility and maintainability.

---

## Color System

### Primary Brand Color

- **Brand Blue**: `#233C63` → `hsl(216, 48%, 26%)`
- Used for primary actions, selected states, and key brand touchpoints

### Semantic Color Tokens

All colors are defined as CSS custom properties in HSL format for easy manipulation and theming.

#### Light Mode (Default)

```css
--background: 0 0% 100%;           /* Pure white */
--foreground: 216 48% 12%;          /* Dark blue-gray for text */

--card: 0 0% 100%;                  /* White cards */
--card-foreground: 216 48% 12%;     /* Dark blue-gray text on cards */

--popover: 0 0% 100%;               /* White popovers */
--popover-foreground: 216 48% 12%; /* Dark blue-gray text in popovers */

--primary: 216 48% 26%;             /* Brand blue #233C63 */
--primary-foreground: 0 0% 100%;    /* White text on primary */

--secondary: 216 20% 94%;           /* Light blue-gray background */
--secondary-foreground: 216 48% 26%; /* Brand blue text on secondary */

--muted: 216 20% 96%;               /* Very light blue-gray */
--muted-foreground: 216 16% 46%;    /* Medium blue-gray for muted text */

--accent: 216 40% 88%;              /* Light accent blue */
--accent-foreground: 216 48% 26%;   /* Brand blue text on accent */

--destructive: 0 84% 60%;           /* Bright red for destructive actions */
--destructive-foreground: 0 0% 100%; /* White text on destructive */

--border: 216 20% 88%;              /* Light blue-gray borders */
--input: 216 20% 88%;               /* Light blue-gray input borders */
--ring: 216 48% 26%;                /* Brand blue focus rings */
```

#### Dark Mode

```css
--background: 222.2 84% 4.9%;       /* Very dark blue-black */
--foreground: 210 40% 98%;          /* Off-white text */

--card: 222.2 84% 4.9%;             /* Very dark blue-black cards */
--card-foreground: 210 40% 98%;     /* Off-white text on cards */

--popover: 222.2 84% 4.9%;          /* Very dark blue-black popovers */
--popover-foreground: 210 40% 98%;  /* Off-white text in popovers */

--primary: 210 40% 98%;             /* Off-white (inverted) */
--primary-foreground: 222.2 47.4% 11.2%; /* Very dark blue-gray */

--secondary: 217.2 32.6% 17.5%;     /* Dark blue-gray */
--secondary-foreground: 210 40% 98%; /* Off-white text on secondary */

--muted: 217.2 32.6% 17.5%;         /* Dark blue-gray */
--muted-foreground: 215 20.2% 65.1%; /* Light blue-gray for muted text */

--accent: 217.2 32.6% 17.5%;        /* Dark blue-gray accent */
--accent-foreground: 210 40% 98%;   /* Off-white text on accent */

--destructive: 0 62.8% 30.6%;       /* Dark red for destructive actions */
--destructive-foreground: 210 40% 98%; /* Off-white text on destructive */

--border: 217.2 32.6% 17.5%;        /* Dark blue-gray borders */
--input: 217.2 32.6% 17.5%;         /* Dark blue-gray input borders */
--ring: 212.7 26.8% 83.9%;          /* Light blue-gray focus rings */
```

#### Sidebar Colors

```css
/* Light Mode Sidebar */
--sidebar-background: 0 0% 98%;
--sidebar-foreground: 216 48% 26%;
--sidebar-primary: 216 48% 26%;
--sidebar-primary-foreground: 0 0% 100%;
--sidebar-accent: 216 20% 94%;
--sidebar-accent-foreground: 216 48% 26%;
--sidebar-border: 216 20% 88%;
--sidebar-ring: 216 48% 26%;

/* Dark Mode Sidebar */
--sidebar-background: 240 5.9% 10%;
--sidebar-foreground: 240 4.8% 95.9%;
--sidebar-primary: 224.3 76.3% 48%;
--sidebar-primary-foreground: 0 0% 100%;
--sidebar-accent: 240 3.7% 15.9%;
--sidebar-accent-foreground: 240 4.8% 95.9%;
--sidebar-border: 240 3.7% 15.9%;
--sidebar-ring: 217.2 91.2% 59.8%;
```

---

## Tailwind Configuration

### Accessing Semantic Tokens

Use the semantic tokens in Tailwind classes:

```tsx
// ✅ CORRECT - Use semantic tokens
<div className="bg-background text-foreground">
<Button className="bg-primary text-primary-foreground">
<Card className="bg-card text-card-foreground border-border">

// ❌ WRONG - Never use direct colors
<div className="bg-white text-black">
<div className="bg-[#233C63]">
```

### Extended Theme Colors

All semantic tokens are available in Tailwind:

```typescript
colors: {
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
  sidebar: {
    DEFAULT: "hsl(var(--sidebar-background))",
    foreground: "hsl(var(--sidebar-foreground))",
    primary: "hsl(var(--sidebar-primary))",
    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
    accent: "hsl(var(--sidebar-accent))",
    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
    border: "hsl(var(--sidebar-border))",
    ring: "hsl(var(--sidebar-ring))",
  },
}
```

### Border Radius

```typescript
borderRadius: {
  lg: "var(--radius)",      // 0.5rem (8px)
  md: "calc(var(--radius) - 2px)", // 6px
  sm: "calc(var(--radius) - 4px)", // 4px
}
```

### Animations

```typescript
keyframes: {
  "accordion-down": {
    from: { height: "0" },
    to: { height: "var(--radix-accordion-content-height)" },
  },
  "accordion-up": {
    from: { height: "var(--radix-accordion-content-height)" },
    to: { height: "0" },
  },
}

animation: {
  "accordion-down": "accordion-down 0.2s ease-out",
  "accordion-up": "accordion-up 0.2s ease-out",
}
```

---

## Component Styling Patterns

### Button Variants

```tsx
// Primary action button
<Button variant="default">Speichern</Button>

// Secondary/subtle action
<Button variant="secondary">Abbrechen</Button>

// Destructive action
<Button variant="destructive">Löschen</Button>

// Outlined button
<Button variant="outline">Bearbeiten</Button>

// Ghost/transparent button
<Button variant="ghost">Mehr</Button>

// Link-style button
<Button variant="link">Details anzeigen</Button>
```

### Badge Variants

```tsx
// Primary badge
<Badge variant="default">Neu</Badge>

// Secondary badge
<Badge variant="secondary">Aktiv</Badge>

// Destructive badge
<Badge variant="destructive">Fehler</Badge>

// Outlined badge
<Badge variant="outline">Entwurf</Badge>
```

### Card Structure

```tsx
<Card>
  <CardHeader>
    <CardTitle>Titel</CardTitle>
    <CardDescription>Beschreibung</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

---

## Typography

### Font Stack

Default system font stack for optimal performance and native feel:

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Text Hierarchy

```tsx
// Page heading
<h1 className="text-3xl font-bold text-foreground">

// Section heading
<h2 className="text-2xl font-semibold text-foreground">

// Card title
<h3 className="text-xl font-semibold text-foreground">

// Body text
<p className="text-base text-foreground">

// Muted/secondary text
<p className="text-sm text-muted-foreground">

// Small/helper text
<span className="text-xs text-muted-foreground">
```

---

## Spacing System

Follow Tailwind's default spacing scale:

```
0.5 → 2px
1   → 4px
2   → 8px
3   → 12px
4   → 16px
6   → 24px
8   → 32px
12  → 48px
16  → 64px
```

### Common Spacing Patterns

```tsx
// Container padding
<div className="container py-8">

// Card padding
<div className="p-6">

// Section spacing
<section className="space-y-6">

// Stack elements
<div className="flex flex-col gap-4">

// Grid gaps
<div className="grid grid-cols-3 gap-6">
```

---

## Responsive Design

### Breakpoints

```
sm: 640px   // Small devices (tablets)
md: 768px   // Medium devices (tablets landscape)
lg: 1024px  // Large devices (desktops)
xl: 1280px  // Extra large devices
2xl: 1400px // Container max-width
```

### Mobile-First Approach

Always design for mobile first, then enhance for larger screens:

```tsx
// Mobile first, then tablet, then desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Hide on mobile, show on desktop
<div className="hidden md:block">

// Full width on mobile, fixed width on desktop
<div className="w-full md:w-auto">
```

---

## Interaction States

### Focus States

```tsx
// Focus ring
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2

// Focus within (for containers)
focus-within:ring-2 focus-within:ring-ring
```

### Hover States

```tsx
// Subtle hover
hover:bg-accent hover:text-accent-foreground

// Primary button hover
hover:bg-primary/90

// Opacity hover
hover:opacity-80
```

### Active/Selected States

```tsx
// Active/pressed state
active:scale-95

// Selected state (use primary color)
data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground
```

### Disabled States

```tsx
disabled:pointer-events-none disabled:opacity-50
```

---

## Shadows

### Standard Shadow Scale

```tsx
// Subtle shadow for cards
className="shadow-sm"

// Default shadow
className="shadow"

// Medium shadow
className="shadow-md"

// Large shadow for modals
className="shadow-lg"

// Extra large shadow
className="shadow-xl"
```

---

## Layout Patterns

### Admin Layout

```tsx
// Sidebar + main content
<div className="flex h-screen">
  <aside className="w-64 bg-sidebar border-r border-sidebar-border">
    {/* Sidebar content */}
  </aside>
  <main className="flex-1 overflow-auto">
    {/* Main content */}
  </main>
</div>
```

### Grid Layouts

```tsx
// Responsive photo grid
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

// Auto-fit grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
```

### Flex Layouts

```tsx
// Horizontal stack with gap
<div className="flex items-center gap-4">

// Vertical stack
<div className="flex flex-col gap-2">

// Space between
<div className="flex items-center justify-between">

// Center content
<div className="flex items-center justify-center min-h-screen">
```

---

## Best Practices

### ✅ DO

1. **Always use semantic tokens** - Never hardcode colors
2. **Follow mobile-first approach** - Design for small screens first
3. **Use design system components** - Leverage shadcn/ui components
4. **Maintain consistent spacing** - Use Tailwind's spacing scale
5. **Test both light and dark modes** - Ensure proper contrast
6. **Use proper semantic HTML** - `<button>`, `<nav>`, `<main>`, etc.
7. **Provide focus states** - Ensure keyboard navigation works
8. **Add loading states** - Show feedback during async operations
9. **Handle errors gracefully** - Display user-friendly error messages

### ❌ DON'T

1. **Never use direct colors** - `bg-white`, `text-black`, `bg-[#233C63]`
2. **Don't use RGB colors** - Always use HSL format
3. **Avoid inline styles** - Use Tailwind classes instead
4. **Don't skip responsive breakpoints** - Test all screen sizes
5. **Never omit alt text** - Always provide image descriptions
6. **Don't use generic z-index values** - Follow a z-index scale
7. **Avoid magic numbers** - Use spacing scale constants
8. **Don't mix color formats** - HSL only in index.css

---

## Component Customization

### Adding New Variants

To add new button variants, update `src/components/ui/button.tsx`:

```typescript
const buttonVariants = cva(
  "base-classes...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        // Add new variant
        premium: "bg-accent text-accent-foreground border-2 border-primary",
      }
    }
  }
)
```

### Adding New Colors

1. Add CSS custom property to `src/index.css`:

```css
:root {
  --success: 142 76% 36%;
  --success-foreground: 0 0% 100%;
}
```

2. Add to `tailwind.config.ts`:

```typescript
colors: {
  success: {
    DEFAULT: "hsl(var(--success))",
    foreground: "hsl(var(--success-foreground))",
  },
}
```

3. Use in components:

```tsx
<Badge className="bg-success text-success-foreground">Erfolg</Badge>
```

---

## Accessibility

### Color Contrast

- Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
- Test with color contrast checker tools
- Semantic tokens are designed with proper contrast ratios

### Focus Management

```tsx
// Keyboard navigation
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring

// Skip to main content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### Screen Reader Support

```tsx
// Hidden but accessible
<span className="sr-only">Beschreibung für Screenreader</span>

// ARIA labels
<button aria-label="Galerie schließen">
  <X className="h-4 w-4" />
</button>
```

---

## File Organization

```
src/
├── index.css              # Design tokens and global styles
├── components/
│   ├── ui/                # Reusable UI components (shadcn)
│   ├── admin/             # Admin-specific components
│   └── client/            # Client-specific components
├── lib/
│   └── utils.ts           # cn() helper for class merging
└── ...
```

---

## Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Radix UI**: https://www.radix-ui.com
- **Lucide Icons**: https://lucide.dev

---

## Version History

- **v1.0** - Initial design system documentation
- Brand color: #233C63
- Light mode primary theme
- Mobile-first responsive design
- German language UI
