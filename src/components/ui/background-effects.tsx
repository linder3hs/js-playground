export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full mix-blend-normal filter blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-normal filter blur-3xl"></div>
    </div>
  );
}
