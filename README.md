<p align="center">
<img src="./screenshots/chaos-gif.gif" alt="gif home page" width="100%"/>
</p>

# Chaos Attractors Simulation
[![React][React.js]][React-url] [![Three][Three.js]][Three-url] ![build]

A modern simulation engine for chaotic attractors in your browser. Chaos‐Equations renders complex chaotic systems (like the Lorenz and Halvorsen attractors) using react‑three‑fiber and Leva controls, letting you explore chaos in real time.

## Features

- **Modular Architecture:**  
  Each attractor is implemented as a separate module. Shared components like `ChaosManager`, `Particle`, and `AttractorWrapper` help reduce code duplication and improve maintainability.

- **Dynamic Simulation Controls:**  
  Leva controls allow you to adjust simulation parameters (e.g., time step, number of particles, trail length, global scaling) in real-time. Dedicated controls let you freeze the simulation and restart it from the beginning.

- **Updated Camera Setup:**  
  Tuned default camera settings for a consistent initial view.

- **Postprocessing Effects:**  
  Includes postprocessing effects (such as UnrealBloomPass) to produce a glowing, vibrant visualization of attractor tips.

## Controls

- `Attractor`: pick the active system from the dropdown.
- `Simulation`: `Particles`, `Trail Length`, `Global Scale`, `Time Step`, `Substeps`.
- `Colors`: `Low Speed Color`, `High Speed Color`, `Speed Color Boost`.
- `Performance`: `Render Resolution`, `Trail Budget (particles × trail length)`.
- `Effects`: toggle `Bloom` and tune `Threshold`, `Strength`, `Radius`.
- `View`: `Show Stats`, `Show Stars`.
- Actions: `freeze` / `restart` buttons appear inside each attractor's control folder, plus `Reset Camera`.

## Screenshots

| Thomas | Default | Lorenz |
| --- | --- | --- |
| ![thomas chaos](./screenshots/Thomas-chaos.png) | ![default](./screenshots/default.png) | ![Lorenz chaos](./screenshots/Lorenz-chaos.png) |

## Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/acharlas/Chaos-Equations.git
   cd Chaos-Equations
   ```

2. **Install and run locally (recommended):**

   ```sh
   npm install
   npm run dev
   ```

   Open your browser and navigate to http://localhost:3000 to see the simulation.

3. **Or build and run with Docker Compose:**

   ```sh
   docker-compose up --build
   ```

   Open your browser and navigate to http://localhost:3000 to see the simulation.

4. **Optional sanity checks:**

   ```sh
   npm run lint
   npm run build
   ```

## Project Overview

- **AttractorManager:**  
  Provides a UI control (via Leva) to switch between multiple attractors.

- **Attractor components:**  
  Each attractor component sets up its own parameters (merged with shared controls), binds its specific chaotic equation, and passes the configuration to the ChaosManager.

- **ChaosManager & Particle:**  
  The ChaosManager spawns multiple particles, each updating its position according to the provided chaotic equation. Each particle renders a trail with a smooth gradient and a glowing tip (a customizable sphere) whose size can be adjusted.

- **AttractorWrapper:**  
  Wraps attractor components in a Three.js group that applies a global scaling factor.

Feel free to explore and tweak the controls in the Leva panel to see how different parameters affect the simulation. Enjoy your chaotic visualizations!

[build]: https://img.shields.io/github/actions/workflow/status/acharlas/Chaos-Equations/deploy.yml
[React.js]: https://img.shields.io/badge/-ReactJs-61DAFB?logo=react&logoColor=white&style=for-the-badge
[React-url]: https://react.dev/
[Three.js]: https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white
[Three-url]: https://threejs.org/
