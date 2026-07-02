# Architecture of Human Scale Reality Check Technologies

This document provides a highly comprehensive architectural breakdown of the **Human Scale Reality Check Technologies** full-stack system. It details the interaction of the frontend rendering layer, local evaluation models, real-time materials engine, and secure cloud persistence schemas.

---

## 1. System Topology Overview

The application is engineered as a highly responsive, full-stack spatial simulation system built on a unified **React 18 + Vite** client and a containerized **Express** server, deploying seamlessly inside **Cloud Run**. 

To provide high-fidelity visual and computational capabilities while keeping client latency near zero, the platform divides tasks into client-side evaluation models and server-side compliance grids:

```
                  ┌──────────────────────────────────────────────┐
                  │                 USER BROWSER                 │
                  │                                              │
                  │   ┌──────────────────────────────────────┐   │
                  │   │        3D Wireframe / Canvas         │   │
                  │   │         (Room3D / SVG Mock)          │   │
                  │   └──────────────────▲───────────────────┘   │
                  │                      │                       │
                  │   ┌──────────────────┴───────────────────┐   │
                  │   │      Continuous Parametric State     │   │
                  │   │        (width, depth, height)        │   │
                  │   └──────────────────▲───────────────────┘   │
                  │                      │                       │
                  │   ┌──────────────────┴───────────────────┐   │
                  │   │   Procurement Quantity Engine (BoQ)  │   │
                  │   └──────────────────▲───────────────────┘   │
                  └──────────────────────┼───────────────────────┘
                                         │
                                         ▼ (Secure Sync / Auth)
                  ┌──────────────────────────────────────────────┐
                  │              CLOUD BACKEND SERVICES          │
                  │                                              │
                  │   ┌──────────────────────────────────────┐   │
                  │   │        Google Firebase Firestore     │   │
                  │   │     (User portfolios & activity logs)│   │
                  │   └──────────────────▲───────────────────┘   │
                  │                      │                       │
                  │   ┌──────────────────┴───────────────────┐   │
                  │   │        Firebase Auth / Rules         │   │
                  │   │      (Attribute-Based Security)      │   │
                  │   └──────────────────────────────────────┘   │
                  └──────────────────────────────────────────────┘
```

---

## 2. Core Functional Modules

The codebase is organized into modular React functional components, separating geometric representation, estimation algebra, diagnostic systems, and legal/corporate reporting.

### A. Viewport Rendering Node (`/src/components/Room3D.tsx` & `/src/components/RoomStudio.tsx`)
*   **Responsibility**: Converts numerical bounding dimensions (Width, Depth, Height) into an immediate, reactive spatial wireframe representation.
*   **Key Logic**:
    *   Dynamic projection of a standard **1.8-meter human outline silhouette** inside the active bounding box, rendering a direct psychological "Reality Check" comparison.
    *   Furniture spatial arrangement presets (Bedroom, double-desk office studio, active lounge, micro-space setups) configured using specific bounding margins.
    *   Staggered entrance animations and layout state controls handled securely via `motion/react` elements.

### B. Materials & Procurement Estimator Engine (`/src/components/ProcurementEstimator.tsx`)
*   **Responsibility**: Converts volumetric room measurements into an itemized, site-ready Bill of Quantities (BoQ) with localized financial assumptions.
*   **Mathematical Models**:
    1.  **Continuous Concrete Footing (Sub-structure)**:
        *   Standard depth: $300\text{mm}$, strip width: $600\text{mm}$.
        *   $\text{Volume} = (\text{Width} \times 2 + \text{Depth} \times 2) \times 0.6 \times 0.3 \ \text{m}^3$.
    2.  **Timber Rafters & Framing Yards**:
        *   Calculates timber lengths assuming a vertical stud grid spaced at $400\text{mm}$ centers.
    3.  **Masonry Discretization**:
        *   *Sandcrete Hollow Blocks*: Standard nominal dimensions ($450\text{mm} \times 225\text{mm} \times 225\text{mm}$).
        *   *Clay Facing Bricks*: Standard dimensions.
        *   Calculations factor in wall height, continuous perimeter, mortar thickness offsets, and a $5\%$ waste margin.
    4.  **Mortar Face Plastering Rendering**:
        *   Predicts double-sided interior and exterior cement rendering requirements ($m^2$).
    5.  **Dynamic Cost Indexing**:
        *   Adapts material rates to specific geographic regions (London, West EU, Tokyo) based on structural multiplier constants.

### C. Persistent Volumetric Ledger (`/src/components/HistoryView.tsx` & Firebase Config)
*   **Responsibility**: Manages secure, real-time synchronization of custom design portfolios.
*   **Storage Architecture**:
    *   Uses **Cloud Firestore** for secure, low-latency collection writes.
    *   `portfolios` collection stores JSON states containing room dimensions, chosen preset types, selected materials, and the author's credentials.
    *   Configures rigorous security definitions in `/firestore.rules` utilizing Attribute-Based Access Control (ABAC) to isolate user assets.

---

## 3. Database Schema

The database model is kept light and robust, using Firestore documents to enable atomic state loads.

### Collection: `portfolios`
```json
{
  "id": "String (Auto-generated Doc ID)",
  "userId": "String (Auth UID reference)",
  "userEmail": "String (Owner identification)",
  "name": "String (e.g., 'Modern Bedroom')",
  "width": "Number (float)",
  "depth": "Number (float)",
  "height": "Number (float)",
  "preset": "String (e.g., 'bedroom', 'studio')",
  "material": "String (e.g., 'sandcrete', 'clay')",
  "notes": "String (Optional)",
  "createdAt": "Timestamp (Server-side)"
}
```

### Collection: `activity_logs` (For diagnostic audit trails)
```json
{
  "id": "String (Auto-generated)",
  "action": "String (e.g., 'portfolio_created')",
  "userEmail": "String",
  "timestamp": "Timestamp",
  "meta": {
    "dimensions": "String (W x D x H)"
  }
}
```

---

## 4. Execution & Network Parameters

The system executes inside a highly optimized containerized sandbox on Cloud Run.

*   **Ingress Network Protocol**: Nginx reverse proxy routing traffic exclusively to **Port 3000**.
*   **Process Management**:
    *   *Development*: Directly boots using `tsx server.ts` to coordinate real-time backend endpoints and hot-reload middleware.
    *   *Production Build*:
        *   Vite compiles static assets into `dist/`.
        *   `esbuild` bundles `/server.ts` into a unified, self-contained CommonJS target (`dist/server.cjs`), eliminating Node relative path imports.
        *   *Start Command*: `node dist/server.cjs` binds to host `0.0.0.0` on Port 3000.
