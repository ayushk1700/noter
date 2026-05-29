export default function AmbientBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#FFEBE4] rounded-full filter blur-[100px] opacity-40 animate-drift-1" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#EAE4FF] rounded-full filter blur-[100px] opacity-45 animate-drift-2" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFF5D1] rounded-full filter blur-[150px] opacity-20 pointer-events-none" />
    </div>
  );
}
