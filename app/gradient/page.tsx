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
      <ShaderGradientCanvas
        style={{ position: 'fixed', inset: 0, zIndex: -1 }}
      >
        <ShaderGradient
          type="plane"
          uSpeed={0.35}
          color1="#2D033B"
          color2="#810CA8"
          color3="#C147E9"
        />
      </ShaderGradientCanvas>

      {/* page content … */}
    </>
  );
} 