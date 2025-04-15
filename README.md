PLEASE READ THE ENTIRE README.md for more information on the project

## 🏁 How to Run

-- bash
-- npm install
-- npm run dev


# Heirarchy – Vue.js + D3 + Pure JS Engineering

This project is an interactive org chart visualizer that supports expand/collapse functionality, cost breakdowns, reporting layers, and other metrics at scale — tested with up to **40,000 employees**.

It was built using two different methodologies:

---

## 🧠 Method 1 – D3-Powered Tree Visualization (Node-working.vue) in the screenshot - 1

The first approach uses the D3.js library to:
- Build a collapsible vertical hierarchy.
- Render SVG-based connection lines between managers and direct reports.
- Display HTML-based info cards with dynamic metrics.
- Animate zoom-outs as nodes are expanded.

Each employee node card shows:
- Manager and individual contributor (IC) cost estimates.
- Manager-to-IC ratio.
- Department, role, and reporting layer information.

While D3 handled layout and interaction well, **connecting lines sometimes become clustered** when expanding deeply nested nodes — a known challenge when mixing D3's layout engine with HTML-based nodes.

---

## 🏗️ Method 2 – Engineering-Based Solution (Pure JavaScript) (I wasn't able to create lines between the nodes)

For the second method, I implemented a fully custom solution by:
1. Creating an `Employee` class for each of the 40,000 individuals.
2. Using a **hash map** for O(1) lookups to efficiently build the parent-child hierarchy.
3. Calculating descendant counts and salary breakdowns using **recursive traversal**.
4. Used Card.vue to display nodes and Heirarchy.vue for logic and calculations

This method allowed for better control over data processing and but not performance(my web browser crashed a lot trying to tweak it) especially when scaling beyond what D3 handles comfortably.

---

## 📸 Screenshot

<img src="./screenshot.png" alt="Heirarchy Screenshot" />

**✅ Best Viewed At 33% Zoom in Browser**  
Due to the scale of the data, the screenshot and live demo are best viewed with your browser zoom set to **33%**.

---

## 🚀 Key Features
- Expand/Collapse tree with dynamic re-rendering.
- Recursive cost and metric calculation per node.
- Styled node cards using Tailwind CSS.
- SVG-based links and animations using D3.
- Responsive to browser resize events.
- Built-in initial zoom on page load and progressive zoom-out on node expansion.

---

## 🧩 Stack

- **Vue 3** (Composition API + `<script setup>`)
- **D3.js** for layout, SVG, and zoom
- **Tailwind CSS** for styling
- **PapaParse** (in final implementation, for CSV parsing)

---

## 💡 Personal Note

This was my **first-ever Vue.js project**. I had never written a line of Vue before starting this, and I was able to ramp up quickly to solve a complex visualization challenge with dynamic state, scale, and performance in mind.

All recursive cost calculations and tree structures were implemented from scratch following the project’s requirements 100%.

---

## 📂 Data Format (CSV)

The data file contains structured org chart data with fields such as:

## 🔍 Known Limitations

- D3’s automatic layout occasionally creates **clustered lines** when many nodes are expanded deeply.
- This visualization is optimized for wide desktop screens. On small viewports, zoom/scale adjustments may be needed.

---

