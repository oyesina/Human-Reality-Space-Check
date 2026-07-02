# Design System Guide: Human Scale Reality Check

This document explains the design language, visual philosophy, typography, spacing structures, and components of the **Human Scale Reality Check** interface. Any developer reading this guide should be able to reconstruct, extend, or iterate on the application UI with absolute stylistic consistency.

---

## 1. Visual Philosophy & Vibe

The application intentionally avoids generic, gradient-heavy, tech-saturated visual templates. Instead, it adopts a **High-Contrast Editorial Brutalism** design style. It feels like a premium Swiss architectural review or physical paper prospectus.

### Core Principles:
*   **Architectural Honesty**: Clean structural borders over soft ambient blurs.
*   **Tactility**: Thick, solid offsets (`shadow-[4px_4px_0_0_rgba(0,0,0,1)]`) that make components feel like physical buttons or structural slabs.
*   **Generous Whitespace**: Large, intentional paddings to convey spatial breathing room.
*   **Anatomical Focus**: Immediate contrast between thin wireframes and dense human silhouette elements.

---

## 2. Color Palette & Theme Specs

The interface uses a warm, eye-safe neutral light theme with strong contrasting dark borders:

| Variable | HEX Code | Tailwind Representation | Application |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#FBF9F4` | `bg-[#FBF9F4]` | Page body, background layers |
| **Pure Neutral White** | `#FFFFFF` | `bg-white` | Active cards, fields, textareas |
| **Solid Ink Black** | `#000000` | `bg-black` / `text-black` | Borders, primary typography, main CTA buttons |
| **Muted Slate Grey** | `#7D7A73` | `text-[#7D7A73]` | Captions, secondary labels, metadata |
| **Off-White Accent** | `#FAF9F5` | `bg-[#FAF9F5]` | Sub-panels, inputs, interactive presets |
| **Vibe Green** | `#047857` | `text-emerald-700` | Budget savings, comfortable height notifications |

---

## 3. Typography Pairings

Typography is the single most critical structural element of the design. It is imported and loaded directly inside `src/index.css`:

1.  **Display Headings (Space Grotesk / Outfit)**:
    *   Used for: Page headers, system titles, and numeric values.
    *   Styling: `font-sans font-extrabold uppercase tracking-tight text-black`
2.  **General Copy (Inter / Helvetica)**:
    *   Used for: Explanations, input labels, tool descriptions.
    *   Styling: `font-sans font-normal tracking-normal text-neutral-800`
3.  **Technical Data & Labels (JetBrains Mono / Fira Code)**:
    *   Used for: Formulas, dimensions, sitemap elements, status logs.
    *   Styling: `font-mono text-xs uppercase tracking-wider text-black`

---

## 4. Atomic UI Components

Here are the HTML and Tailwind snippets required to replicate the primary design elements:

### A. The Structural Neo-Brutalist Card
This is the core container for components, charts, and input forms. It features a solid, un-blurred ink-black shadow.

```tsx
<div className="bg-white border-2 border-black p-6 sm:p-8 shadow-[6px_6px_0_0_rgba(0,0,0,1)] relative transition-all">
  {/* Card Title Header */}
  <div className="flex items-center gap-2 border-b border-black pb-3 mb-6">
    <Sliders size={16} className="text-black" />
    <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
      Component Header_
    </span>
  </div>
  
  {/* Content */}
  <p className="font-serif text-sm leading-relaxed text-neutral-700">
    Your content goes here...
  </p>
</div>
```

### B. Tactile Interactive Buttons
Buttons use physical translation offsets upon click to mimic keypress action:

```tsx
<button className="px-5 py-3 border border-black bg-white text-[10px] uppercase font-bold tracking-wider shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-2 active:translate-y-2 cursor-pointer transition-all">
  Execute Reality Check_
</button>
```

### C. Continuous Range Sliders
Sliders are kept minimal and styled to align with structural guidelines:

```tsx
<div className="flex flex-col gap-2 font-mono text-[10px] uppercase font-bold">
  <div className="flex justify-between">
    <span>Ceiling Height (m)</span>
    <span className="text-black font-extrabold">2.8m</span>
  </div>
  <input 
    type="range" 
    min="2.0" 
    max="4.5" 
    step="0.1" 
    className="w-full accent-black h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
  />
</div>
```

---

## 5. Micro-Animations & Transitions

We use `motion/react` for elegant visual feedback that never slows down the interface.

*   **Modal Overlays (Auth / Article Details)**:
    *   Background backdrop fade-in: `initial={{ opacity: 0 }} animate={{ opacity: 1 }}`
    *   Card scale slide-up: `initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }}`
*   **Tab Transitions**:
    *   Standard subtle crossfade transitions: `duration: 0.15s`
*   **Perspective Scaling**:
    *   The SVG wireframe viewport size binds instantly to parameter changes. Smooth CSS transitions (`transition-all duration-150`) cushion coordinate shifts.
