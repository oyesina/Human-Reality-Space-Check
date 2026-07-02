# Human Scale Reality Check Technologies

> **"Before you pour the concrete slab or frame the timber rafters, execute a real-time volumetric reality check."**

An interactive, volumetric, and parametric spatial visualization suite built to settle residential spatial designs and material quantities before breaking ground. It bridges the gap between dry 2D blueprint drafting and real-world human scale physical movement comfort.

---

## 🗺️ System Architecture Workflow

Below is the procedural workflow detailing how spatial state input translates into three-dimensional wireframes, quantity takeoffs, and secure data syncs:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. VISUALIZER & PARAMETRIC SLIDERS                                     │
│    User sets Width (2m-12m), Depth (2m-12m), Height (2m-4.5m)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ (Instant State Propagation)
┌───────────────────────────────────┴────────────────────────────────────┐
│ 2. DYNAMIC WORKSPACE CALCULATION ENGINES                               │
│                                                                        │
│  A. Spatial Vibe Evaluation       B. Material Procurement (BoQ)        │
│     • Calculates m³ Volume           • Strip Concrete Volume (m³)       │
│     • Prevents Claustrophobia        • Masonry Block/Brick counts       │
│     • Silhouette Height Reference    • Plaster Area Rendering (m²)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ (Manual or Auto Sync)
┌───────────────────────────────────┴────────────────────────────────────┐
│ 3. PERSISTENT SYSTEM LEDGER                                            │
│    Saves configuration state securely into Firebase Firestore           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Visual Component Layout Map

The workspace UI is divided into modular, high-contrast, bento-inspired sections that are easy to use on both mobile and desktop views:

```
+-----------------------------------------------------------------------+
|  🏛️ BRAND BAR (Logo, Sub-Title, Active Version, Access Studio CTA)     |
+-----------------------------------------------------------------------+
|                                                                       |
|  [ HERO INTRO ]                           [ DYNAMIC PLAYGROUND ]      |
|  Visualize room dimensions                 +------------------------+ |
|  relative to the human body.               | Parametric Sliders     | |
|                                            | Width  [===========]   | |
|  "The human body is the                    | Depth  [========]      | |
|   measure of architecture."                | Height [=======]       | |
|                                            |                        | |
|  +--------------------+                    | [ WIREFRAME PREVIEW ]  | |
|  | Launch Space Studio|                    |  +------------------+  | |
|  +--------------------+                    |  |   ___O___        |  | |
|                                            |  |      |  (1.8m)   |  | |
|                                            |  |     / \          |  | |
|                                            |  +------------------+  | |
|                                            +------------------------+ |
+-----------------------------------------------------------------------+
|  🧭 SECTION 01: EXPLORE SYSTEM LEDGER                                 |
|  +-------------------------+  +-----------------+  +----------------+ |
|  | Articles & Spatial Logic |  | System Sitemap  |  | Customer       | |
|  | • Claustrophobia Threshold|  | • 01 Space Sim  |  |   Success      | |
|  | • Material Takeoff Maths |  | • 02 BoQ Estim  |  |   Records      | |
|  +-------------------------+  +-----------------+  +----------------+ |
+-----------------------------------------------------------------------+
|  💼 SECTION 02: PHILOSOPHY & CAREERS                                  |
|  +-------------------------+  +-----------------+  +----------------+ |
|  | Minimalist Tool Concept |  | Open Careers    |  | Newsroom Posts | |
|  +-------------------------+  +-----------------+  +----------------+ |
+-----------------------------------------------------------------------+
|  🔒 SECTION 03: GOVERNANCE, SECURITY & INTERACTIVE SUPPORT            |
|  +-------------------------+  +-----------------+  +----------------+ |
|  | Privacy Protocols        |  | Terms & Licens  |  | Support Ticket | |
|  | (Firestore Rules)       |  |                 |  | Submit Form    | |
|  +-------------------------+  +-----------------+  +----------------+ |
+-----------------------------------------------------------------------+
|  🌐 SOCIAL NETWORK CONNECTORS (Twitter, Instagram, Facebook, LinkedIn) |
+-----------------------------------------------------------------------+
```

---

## ⚡ Main Operational Workflows

### 1. Spatial Comfort & Vibe Evaluation
When the room dimensions are modified, the **Subjective Vibe Calculator** dynamically evaluates the vertical volume relative to human comfort expectations:
*   **Oppressive (< 2.1m Height)**: Triggers warnings about low clearances.
*   **Standard (2.1m to 2.4m Height)**: Normal room baseline.
*   **Airy (2.4m to 3.0m Height)**: Premium modern clearance.
*   **Monumental (> 3.0m Height)**: Extremely tall, spatial luxury, human element is dwarfed.

### 2. Live Bill of Quantities (BoQ) Calculation
1.  **Concrete Base Volume**: Checks footing perimeters and thickness matrices.
2.  **Continuous Timber Studs**: Calculates stud counts required based on a 400mm framing layout.
3.  **Masonry Unit Calculations**:
    *   *Sandcrete Blocks*: Calculates counts based on $450\text{mm} \times 225\text{mm} \times 225\text{mm}$ standard sizing.
    *   *Clay Facing Bricks*: Sourced based on traditional small clay masonry.
4.  **Surface Cement Plaster Rendering**: Predicts exact $m^2$ coverage of internal and external faces.

### 3. Support Ledger Submission
Users can file inquiries directly inside the Support Desk form. The system dynamically issues a unique secure ticket ID (`TKT-2026-XXXX`) and persists the entry in localized memory ledgers representing immediate customer care.

---

## 🛠️ Project Development Setup

### Installation
Ensure your node environment is active, then execute:
```bash
npm install
```

### Dev Execution Mode
Runs the local server directly in development configuration with hot module updates:
```bash
npm run dev
```

### Production Bundling
Bundles static client assets and packs the Express server using `esbuild`:
```bash
npm run build
```

### Production Boot
Starts the compiled standalone CommonJS Express service:
```bash
npm run start
```
