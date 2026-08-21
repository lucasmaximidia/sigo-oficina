---
name: Technical Precision Interface
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3e484d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6e797e'
  outline-variant: '#bdc8ce'
  surface-tint: '#006780'
  primary: '#00647c'
  on-primary: '#ffffff'
  primary-container: '#007f9d'
  on-primary-container: '#fafdff'
  inverse-primary: '#6cd3f7'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006948'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855d'
  on-tertiary-container: '#f5fff7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b7eaff'
  primary-fixed-dim: '#6cd3f7'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#004e61'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 24px
  gutter: 16px
---

## Brand & Style

The design system is engineered for efficiency, clarity, and reliability within the appliance repair industry. It adopts a **Corporate / Modern** aesthetic with high-utility layouts that prioritize legibility for technicians and administrative staff who require immediate access to status updates and parts inventory.

The interface evokes a sense of "clean machinery"—stable, professional, and trustworthy. It utilizes generous whitespace and a systematic hierarchy to reduce cognitive load in fast-paced environments. The focus is on utility over decoration, ensuring that the software feels like a precision tool rather than a distraction.

## Colors

The palette is anchored by a deep Cyan (#0891B2), symbolizing the technical nature of home appliance repair and maintenance.

- **Primary**: Used for key interactions, active states, and brand presence.
- **Secondary**: A deep Slate (#0F172A) reserved for high-contrast typography and navigation backgrounds.
- **Background**: A crisp, cool grey (#F8FAFC) ensures that white surface cards pop with distinct separation.
- **Semantic Feedback**: Green (#059669) denotes completed repairs or successful payments; Yellow (#F59E0B) indicates pending parts or technician delays; Red (#DC2626) flags urgent repairs or overdue invoices.

## Typography

The design system exclusively uses **Inter**, a highly legible neo-grotesque sans-serif. This choice ensures maximum readability on both low-resolution mobile screens in the field and high-resolution desktop monitors in the office.

- **Headlines**: Use `600` weight for clear section delineation.
- **Body Text**: The `body-md` (14px) is the workhorse for data tables and form labels to maximize information density without sacrificing clarity.
- **Labels**: Small uppercase labels are used for metadata like machine model numbers and serial codes to differentiate them from standard descriptive text.

## Layout & Spacing

This design system employs a **Fluid Grid** approach with strict 8px logic.

- **Desktop**: 12-column grid with 24px side margins. Sidebar navigation is fixed at 260px width.
- **Mobile**: Single column layout. Side margins reduce to 16px. Touch targets must be at least 44px in height.
- **Content Density**: Use `lg` (24px) spacing for top-level layout containers and `sm` (12px) for internal card padding to maintain a compact, data-efficient feel.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and subtle shadows. 

1. **Base Layer**: The background (#F8FAFC) provides the foundation.
2. **Surface Layer**: Main content areas use white (#FFFFFF) cards with a `shadow-sm` (0 1px 2px rgba(15, 23, 42, 0.05)).
3. **Elevated Layer**: Modals and dropdown menus use a more pronounced shadow to indicate temporary focus and physical stacking above the main UI.

Avoid heavy shadows. Instead, use thin 1px borders (#E2E8F0) to define boundaries within the white surfaces.

## Shapes

The design system follows a **Rounded** (12px) philosophy to soften the technical nature of the interface and make the software feel modern and approachable.

- **Primary Containers**: 12px border radius.
- **Buttons and Inputs**: Consistent 12px radius to create a unified interactive language.
- **Small Indicators**: Tags and status badges use a 6px radius or full pill-shape to distinguish them from larger interactive components.

## Components

### Buttons
- **Primary**: Solid #0891B2 with white text. 12px rounded corners. Height: 40px (Desktop) / 48px (Mobile).
- **Secondary**: White background with #0891B2 border and text.
- **Ghost**: No border, used for secondary actions like "Cancel".

### Input Fields
- Outlined style with 1px border (#CBD5E1). 
- Active state: 2px border #0891B2 with a subtle glow.
- Labels are positioned outside the input for persistent visibility.

### Status Chips
- Small badges with light background tints (e.g., 10% opacity of the status color) and bold text of the same hue. Used for "In Progress," "Waiting for Parts," or "Ready for Pick-up."

### Cards
- Use for Service Orders (OS). Must include a clear header with the OS ID, a body for the client/machine details, and a footer for the primary CTA (e.g., "Start Repair").

### Icons
- **Outlined Style**: 2px stroke weight. Use simple metaphors (e.g., a wrench for repair, a house for on-site visit, a clock for history).