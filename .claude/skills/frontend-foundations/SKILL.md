---
name: frontend-foundations
description: Build responsive frontend pages and reusable UI components with clean layout and styling.
---

# Frontend Foundations Skill

## Instructions

1. **Page Structure**
   - Semantic HTML5 structure
   - Clear separation of sections (header, main, footer)
   - Accessibility-friendly markup

2. **Component Design**
   - Reusable, modular components
   - Consistent spacing and typography
   - Props/variants for flexibility (buttons, cards, inputs)

3. **Layout System**
   - Use Flexbox and Grid appropriately
   - Responsive breakpoints (mobile, tablet, desktop)
   - Fluid containers and alignment consistency

4. **Styling**
   - Modern CSS (Flexbox, Grid, variables)
   - Scalable class naming (BEM, utility-first, or component-based)
   - Theme-ready colors and typography
   - Hover, focus, and active states

5. **Responsiveness**
   - Mobile-first approach
   - Touch-friendly interactions
   - Adaptive typography and spacing

## Best Practices
- Keep components small and focused
- Prefer composition over duplication
- Use design tokens (colors, spacing, fonts)
- Ensure accessibility (contrast, keyboard navigation)
- Optimize for performance (minimal CSS, reusable styles)

## Example Structure

```html
<main class="page">
  <header class="page-header">
    <h1 class="page-title">Page Title</h1>
    <p class="page-subtitle">Short supporting description</p>
  </header>

  <section class="content-grid">
    <article class="card">
      <h2 class="card-title">Component Title</h2>
      <p class="card-text">Component content goes here.</p>
      <button class="btn-primary">Action</button>
    </article>

    <article class="card">
      <h2 class="card-title">Another Component</h2>
      <p class="card-text">Reusable and responsive layout.</p>
      <button class="btn-secondary">Learn More</button>
    </article>
  </section>
</main>
