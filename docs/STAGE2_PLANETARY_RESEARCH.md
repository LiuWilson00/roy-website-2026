# Stage 2: Planetary Motion - 3D Perspective Research

## Overview

This document analyzes the feasibility of implementing a planetary motion effect with 3D perspective simulation for Stage 2 of the CyberIris particle system.

### Requirements
- Light core acts as the sun (center)
- 80 particles simulate planets orbiting
- 3D perspective: farther particles appear smaller and more transparent
- Tilted viewing angle (~5 degrees from horizontal)
- Smooth transition from Stage 1

---

## Technical Approach

### 1. Perspective Projection Formula

The standard formula for projecting 3D coordinates to 2D screen space:

```typescript
// Basic perspective projection
function project3D(x: number, y: number, z: number, focalLength: number): Point {
  const scale = focalLength / (focalLength + z)
  return {
    x: x * scale + centerX,
    y: y * scale + centerY,
    scale  // Used for size/opacity adjustment
  }
}
```

**Key Parameters:**
- `focalLength`: Controls perspective intensity (higher = flatter, lower = more dramatic)
- `z`: Depth value (positive = away from viewer, negative = toward viewer)
- `scale`: Determines particle size and opacity based on depth

**Reference:** [3D Projection - jsantell.com](https://jsantell.com/3d-projection/)

### 2. Tilted Orbital Plane

To simulate a 5-degree viewing angle, we project the orbital plane:

```typescript
// Tilt projection around X-axis
function applyTilt(x: number, y: number, z: number, inclination: number): Point3D {
  const cosI = Math.cos(inclination)
  const sinI = Math.sin(inclination)
  return {
    x: x,
    y: y * cosI - z * sinI,  // Y compressed by tilt
    z: y * sinI + z * cosI   // Z shifted by tilt
  }
}
```

**Effect of Tilt:**
- A circular orbit viewed at an angle becomes an ellipse
- 5 degrees is subtle but noticeable
- Creates depth variation as particles orbit (front vs back)

**Reference:** [The Effect of a Tilt - RIT Physics](http://spiff.rit.edu/classes/phys440/lectures/tilt/tilt.html)

### 3. Depth-Based Rendering

For proper 3D illusion:

```typescript
interface Particle3D {
  id: number
  orbitRadius: number    // Distance from sun
  theta: number          // Current orbital angle
  orbitSpeed: number     // Angular velocity
  orbitPhase: number     // Starting phase offset
}

// Depth-dependent properties
function getDepthProperties(z: number, maxZ: number) {
  const normalizedZ = (z + maxZ) / (2 * maxZ)  // 0 (far) to 1 (near)
  return {
    size: lerp(minSize, maxSize, normalizedZ),
    opacity: lerp(minOpacity, maxOpacity, normalizedZ),
    // Optional: blur for depth of field
  }
}
```

**Reference:** [How to render 3D in 2D canvas - Mamboleoo](https://www.mamboleoo.be/articles/how-to-render-3d-in-2d-canvas)

---

## Implementation Design

### Orbital System Configuration

```typescript
const STAGE2_CONFIG = {
  // Perspective settings
  focalLength: 800,           // Perspective intensity
  tiltAngle: 5 * Math.PI / 180,  // 5 degrees in radians

  // Orbital layers (distribute 80 particles)
  orbits: [
    { radius: 80,  count: 8,  speed: 0.15, direction: 1 },   // Inner fast
    { radius: 120, count: 12, speed: 0.12, direction: -1 },  //
    { radius: 160, count: 16, speed: 0.09, direction: 1 },   //
    { radius: 200, count: 18, speed: 0.07, direction: -1 },  //
    { radius: 240, count: 14, speed: 0.05, direction: 1 },   //
    { radius: 280, count: 12, speed: 0.03, direction: -1 },  // Outer slow
  ],
  // Total: 80 particles

  // Depth rendering
  minSize: 1.5,
  maxSize: 4,
  minOpacity: 0.3,
  maxOpacity: 1.0,
}
```

### Transform Function

```typescript
function stage2Transform(particle: Particle, context: TransformContext): ParticleState {
  const { time, center } = context
  const config = STAGE2_CONFIG

  // Get particle's orbit assignment
  const orbit = getParticleOrbit(particle.id)

  // Calculate orbital position in 3D space
  const angle = particle.theta + time * orbit.speed * orbit.direction * Math.PI * 2
  const x3d = Math.cos(angle) * orbit.radius
  const z3d = Math.sin(angle) * orbit.radius
  const y3d = 0  // Flat orbital plane

  // Apply tilt (rotate around X-axis)
  const tilted = applyTilt(x3d, y3d, z3d, config.tiltAngle)

  // Project to 2D with perspective
  const projected = project3D(tilted.x, tilted.y, tilted.z, config.focalLength)

  // Calculate depth-based properties
  const depth = getDepthProperties(tilted.z, orbit.radius)

  return {
    x: center.x + projected.x,
    y: center.y + projected.y,
    r: depth.size,
    opacity: depth.opacity,
    glow: depth.size * 2,
    trailLength: 0.6,
  }
}
```

### Z-Sorting for Proper Occlusion

Since SVG renders in DOM order, we need to sort particles by depth:

```typescript
// Option A: Sort particles array before rendering each frame
// Pro: Correct occlusion
// Con: Requires dynamic DOM manipulation, potential performance impact

// Option B: Use opacity-only depth (no occlusion)
// Pro: Simple, no DOM changes
// Con: Particles may overlap incorrectly

// Option C: Use separate layers for front/back
// Pro: Partial occlusion, simpler than full sort
// Con: May have artifacts at layer boundaries
```

**Recommendation:** For 80 particles with glow effects, **Option B (opacity-only)** is sufficient. The overlapping artifacts will be masked by the glow and similar colors.

---

## Performance Analysis

### Current System
- 80 SVG circles + trails + glow overlay
- GSAP ticker updates at 60fps
- Stage 0/1 transforms: Simple trigonometry

### Stage 2 Additional Calculations
Per particle per frame:
1. Orbital angle calculation: O(1)
2. 3D position: 2 trig calls
3. Tilt transform: 4 multiplications
4. Perspective projection: 1 division, 2 multiplications
5. Depth properties: 2 lerps

**Total: ~15 operations per particle per frame = 1,200 ops/frame**

**Verdict:** Negligible performance impact. Modern browsers handle this easily.

### Memory
No additional memory required beyond existing particle state.

---

## Feasibility Assessment

### Pros
1. **Mathematically straightforward** - Standard 3D projection formulas
2. **Performance is excellent** - Only basic math, no heavy computation
3. **Fits existing architecture** - Just another transform function
4. **Smooth transitions** - Interpolation will work naturally
5. **Visual impact** - Creates depth and movement variety

### Cons / Challenges
1. **Z-sorting complexity** - Full occlusion requires DOM reordering
2. **5-degree tilt is subtle** - May not be noticeable enough
3. **Uniform orbital planes** - All particles in same plane looks flat
4. **Trail rendering** - Trails may look odd with varying particle sizes

### Mitigation Strategies

| Challenge | Solution |
|-----------|----------|
| Z-sorting | Use opacity-only depth, skip DOM reordering |
| Subtle tilt | Can increase to 10-15 degrees if needed |
| Flat appearance | Add slight random inclination per orbit |
| Trail issues | Scale trail opacity with depth |

---

## Recommended Implementation

### Phase 1: Basic Planetary Motion
1. Implement orbital transform without tilt
2. Add perspective projection
3. Implement depth-based size/opacity

### Phase 2: Add Tilt and Polish
1. Apply 5-degree tilt transformation
2. Fine-tune visual parameters
3. Add slight orbital plane variation for visual interest

### Phase 3: Interactions
1. Gravity well effect on mouse hover
2. Speed boost near sun when mouse approaches

---

## Visual Comparison

```
Stage 1 (Bloom)                    Stage 2 (Planetary)
┌─────────────────────┐            ┌─────────────────────┐
│     ○ ○ ○ ○        │            │         ·  ·        │
│   ○         ○      │            │     ·         ·     │
│  ○    ☀️    ○     │   ──→      │   ○     ☀️    ○    │
│   ○         ○      │            │     °         °     │
│     ○ ○ ○ ○        │            │         ·  ·        │
└─────────────────────┘            └─────────────────────┘
  Concentric rotating               Perspective orbits
  layers (2D)                       (pseudo-3D)
```

Legend:
- `○` = Large (near)
- `°` = Medium
- `·` = Small (far)

---

## Conclusion

**Feasibility: HIGH**

The planetary motion with 3D perspective is **highly feasible** and **recommended for implementation**. The mathematical complexity is low, performance impact is negligible, and it fits perfectly into the existing architecture.

The main visual challenge is that 5-degree tilt is very subtle. Consider:
- Starting with 10 degrees for more visible effect
- Adding slight random variation to orbital planes
- Using stronger depth-based size scaling

### Estimated Implementation Time
- Basic orbital motion: ~30 minutes
- Perspective projection: ~20 minutes
- Tilt and depth effects: ~30 minutes
- Fine-tuning and transitions: ~30 minutes

**Total: ~2 hours**

---

## References

1. [3D Projection - jsantell.com](https://jsantell.com/3d-projection/)
2. [How to render 3D in 2D canvas - Mamboleoo](https://www.mamboleoo.be/articles/how-to-render-3d-in-2d-canvas)
3. [The Effect of a Tilt of the Orbital Plane - RIT](http://spiff.rit.edu/classes/phys440/lectures/tilt/tilt.html)
4. [3D Perspective Projection on Canvas](https://thecodeplayer.com/walkthrough/3d-perspective-projection-canvas-javascript)
5. [Perspective Projection - Gabriel Gambetta](https://gabrielgambetta.com/computer-graphics-from-scratch/09-perspective-projection.html)
6. [Orbital Inclination - Wikipedia](https://en.wikipedia.org/wiki/Orbital_inclination)
