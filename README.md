# Chaos Attractors Simulation

This project refactors and modernizes an older codebase to simulate chaotic attractors using **react-three-fiber** and **Leva** controls. The code has been reorganized into modular components to improve maintainability and performance. The simulation features two main attractors – **Halvorsen** and **Lorenz** – each with its own dedicated equation, and a generic particle system that displays a smooth color gradient trail. Additionally, you can freeze the simulation or restart it from the beginning using Leva buttons.


## Key Features

- **Modular Architecture:**  
  Each attractor (Halvorsen and Lorenz) is implemented as a separate module. Shared components like `ChaosManager`, `Particle`, and `AttractorWrapper` help reduce code duplication and improve maintainability.

- **Dynamic Simulation Controls:**  
  Leva controls allow you to adjust simulation parameters (e.g., time step, number of particles, trail length, global scaling) in real-time. Two dedicated Leva buttons let you freeze the simulation and restart it from the beginning.

- **Smooth Gradient Trails:**  
  Particle trails are rendered with a smooth color gradient that transitions along the trail based solely on the index of each point, ensuring continuous color interpolation.

- **Updated Camera Setup:**  
  The default camera parameters have been updated to use the logged values for position, field of view, near, and far, ensuring an optimal initial view of the simulation.

- **Postprocessing Effects:**  
  The project includes an UnrealBloomPass effect to enhance the glow of the attractor tips, making the visualization more vibrant.



## Getting Started

1. **Install Dependencies:**

   Run the following command in the project directory:
   
   ```sh
   npm install
   ```
   
2. **Run the Project:**

   Start the development server with:
   
   ```sh
   npm start
   ```
   
3. **Interact with the Simulation:**

   - Use the Leva panel to adjust simulation parameters.
   - Use the freeze and restart buttons in the Leva panel to control the simulation flow.
   - Orbit controls allow you to navigate the 3D scene.

## Project Overview

- **AttractorManager:**  
  Provides a UI control (via Leva) to switch between the Halvorsen and Lorenz attractors.

- **HalvorsenAttractor / LorenzAttractor:**  
  Each attractor sets up its own parameters (merged with shared controls), binds its specific chaotic equation, and passes the configuration to the ChaosManager.

- **ChaosManager & Particle:**  
  The ChaosManager spawns multiple particles, each updating its position according to the provided chaotic equation. Each particle renders a trail with a smooth gradient and a glowing tip (a customizable sphere) whose size can be adjusted.

- **AttractorWrapper:**  
  Wraps attractor components in a Three.js group that applies a global scaling factor.


Feel free to explore and tweak the controls in the Leva panel to see how different parameters affect the simulation. Enjoy your chaotic visualizations!
