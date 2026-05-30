export default function AmbientBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#FCFBF8]">
      <div
        className="absolute inset-[-12%] opacity-80"
        style={{ animation: 'ambient-rotate 44s linear infinite' }}
      >
        <div className="absolute left-[-8%] top-[8%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,125,84,0.30)_0%,rgba(255,125,84,0.08)_38%,rgba(255,125,84,0)_72%)] blur-3xl animate-drift-1" />
        <div className="absolute right-[-10%] top-[14%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.24)_0%,rgba(99,102,241,0.08)_42%,rgba(99,102,241,0)_74%)] blur-3xl animate-drift-2" />
        <div className="absolute left-[20%] top-[46%] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,214,102,0.28)_0%,rgba(255,214,102,0.08)_35%,rgba(255,214,102,0)_72%)] blur-[120px] animate-drift-1" />
        <div className="absolute bottom-[-14%] right-[18%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.14)_0%,rgba(16,185,129,0.05)_36%,rgba(16,185,129,0)_74%)] blur-3xl animate-drift-2" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.65),transparent_34%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent_28%),radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_52%)] mix-blend-screen opacity-60" />

      <div className="absolute inset-0 opacity-[0.09] mix-blend-soft-light">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <filter id="ambient-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#ambient-noise)" opacity="0.45" />
        </svg>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-[#FCFBF8]/40" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.028)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.028)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.12]" />
    </div>
  );
}
