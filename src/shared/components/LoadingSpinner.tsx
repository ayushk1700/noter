export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9F8F6]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#F9F8F6] border-t-[#FF7D54] rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading Fokus...</p>
      </div>
    </div>
  );
}
