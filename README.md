# ROY.DEV - Interactive Portfolio Website

A sci-fi inspired, interactive portfolio website featuring particle animations, scroll-based stage transitions, and immersive UI design.

## Features

- **Multi-Stage Scroll Experience** - Four distinct stages with smooth transitions
- **Interactive Particle System** - GSAP-powered particle animations that respond to scroll and user interaction
- **Responsive Design** - Optimized layouts for both desktop and mobile devices
- **Sci-Fi Aesthetic** - Cyberpunk-inspired UI with glowing effects and glass morphism

## Stages

| Stage | Name | Description |
|-------|------|-------------|
| 0 | **Intro** | CyberIris breathing circle with typewriter name effect |
| 1 | **Evolution & Mastery** | Timeline of experience + Skills dashboard |
| 2 | **Project Galaxy** | Interactive project carousel with planet-style cards |
| 3 | **System Control / Contact** | Sci-fi styled contact information cards |

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Animation:** GSAP (GreenSock Animation Platform)
- **Styling:** Tailwind CSS
- **Rendering:** HTML5 Canvas (particle system)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone git@github.com:LiuWilson00/roy-website-2026.git

# Navigate to project directory
cd roy-website-2026

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── GlobalNav.tsx        # Navigation menu
│   ├── IntroOverlay.tsx     # Stage 0 intro content
│   ├── ParticleCanvas.tsx   # Main canvas + stage orchestration
│   ├── stage1/              # Timeline & Skills components
│   ├── stage2/              # Project Galaxy components
│   └── stage4/              # Contact section components
├── hooks/
│   └── useStageComputation.ts  # Stage transition logic
├── particles/
│   ├── core.ts              # Particle system core
│   ├── interpolation.ts     # Stage interpolation
│   ├── transforms/          # Stage-specific particle transforms
│   └── types.ts             # Type definitions
└── utils/
    └── math.ts              # Math utilities
```

## Customization

### Personal Information

Edit the data files to customize content:

- `src/components/stage1/data.ts` - Timeline & skills data
- `src/components/stage2/data.ts` - Project information
- `src/components/stage4/data.ts` - Contact links

### Particle System

Particle behavior can be customized in:

- `src/particles/config.ts` - Particle count, colors, sizes
- `src/particles/transforms/` - Stage-specific animations

## License

MIT License

---

Built with Claude Code
