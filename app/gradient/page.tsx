'use client';

import dynamic from 'next/dynamic';

// ↓  load on client only to avoid SSR mismatches
const ShaderGradientCanvas = dynamic(
  () => import('@shadergradient/react').then(m => m.ShaderGradientCanvas),
  { ssr: false },
);
const ShaderGradient = dynamic(
  () => import('@shadergradient/react').then(m => m.ShaderGradient),
  { ssr: false },
);

export default function GradientPage() {
  return (
    <>
      {/* fallback CSS gradient stays as safety-net */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage:
            'linear-gradient(45deg,#2D033B,#810CA8,#C147E9)',
          backgroundSize: '400% 400%',
          backgroundRepeat: 'no-repeat',
          animation: 'gradient 6s ease infinite',
        }}
      />

      {/* WebGL gradient */}
      <ShaderGradientCanvas style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
            <ShaderGradient
                /* core colours */
                color1="#180e36"
                color2="#4828a8"
                color3="#4624ad"

                /* noise / motion */
                uSpeed={.3}
                uStrength={2}
                uDensity={3}
                uFrequency={.9}
                uAmplitude={.5}

                // /* camera & lighting (optional) */
                // cDistance={30}     // pull camera back
                // cPolarAngle={110}
                // brightness={1.1}

                // /* mesh transform */
                // type="plane"
                // animate="on"
                // uTime={0}
                // positionX={0}
                // positionY={0}
                // positionZ={0}
                // rotationX={0}
                // rotationY={0}
                // rotationZ={0}
                // reflection={0.1}
                // wireframe={false}

                // /* custom shader (optional) */
                // shader="defaults"

                // /* spring options (placeholders) */
                // rotSpringOption={{}}
                // posSpringOption={{}}

                // /* gradient control */
                // control="props"

                // /* camera */
                // cAzimuthAngle={180}
                // cameraZoom={1}

                // /* effects */
                // lightType="3d"
                // envPreset="city"
                // grain="off"
                // grainBlending={0.3}

                // /* tooling */
                zoomOut={false}
                // toggleAxis={false}
                // hoverState=""

                // /* transitions */
                // enableTransition={false}
            />
            </ShaderGradientCanvas>

      {/* page content … */}
    </>
  );
} 