export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-primary">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">INITIALIZING SYSTEMS</h1>
        <div className="w-64 h-2 bg-primary/20 mx-auto">
          <div className="h-full bg-primary animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
