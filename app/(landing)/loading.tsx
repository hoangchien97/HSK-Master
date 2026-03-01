export default function LandingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted text-sm animate-pulse">Đang tải...</p>
      </div>
    </div>
  );
}
