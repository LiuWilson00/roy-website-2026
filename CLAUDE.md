# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Architecture Overview

This is a scroll-driven portfolio with a custom particle animation system. The site has 4 stages (0-3) that transition as users scroll through 400vh of content.

### Particle System Flow

```
ParticleCanvas.tsx (orchestrator)
    │
    ├── useScrollProgress → scrollProgress [0-3]
    │
    ├── useStageComputation
    │       │
    │       ├── stages[n].transform(particle, context) → ParticleState
    │       └── interpolateState() for smooth transitions
    │
    └── GSAP ticker → updateAllParticles() → SVG DOM updates
```

### Key Concepts

**Stage Transitions**: `scrollProgress` is a float from 0-3. `Math.floor(scrollProgress)` gives current stage, `scrollProgress % 1` gives transition progress. States interpolate between stages.

**Transform Functions**: Each stage defines a `transform(particle, context) → ParticleState` function in `src/particles/transforms/`. These calculate x, y, r, opacity, color for each of the 80 particles based on time, mouse position, and scroll progress.

**Overlay Components**: Each stage has an overlay component (`IntroOverlay`, `Stage1Overlay`, etc.) that fades in/out based on `scrollProgress`. They use visibility ranges defined in their `types.ts` files.

### Adding a New Stage

1. Create transform in `src/particles/transforms/stageN-name.ts`
2. Export from `src/particles/transforms/index.ts`
3. Add to `STAGES` array in `ParticleCanvas.tsx`
4. Create overlay component if needed in `src/components/stageN/`

### Content Customization

- `src/components/stage1/data.ts` - Timeline & skills
- `src/components/stage2/data.ts` - Projects
- `src/components/stage4/data.ts` - Contact links

## Tech Stack

- React 18 + TypeScript + Vite
- GSAP for animations (ticker-based particle updates, useGSAP hook)
- Tailwind CSS v4
- SVG rendering for particles (direct DOM manipulation for performance)
