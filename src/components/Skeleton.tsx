export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-100" />
      <div className="p-5">
        <div className="h-3 w-20 bg-slate-100 rounded mb-4" />
        <div className="h-5 w-full bg-slate-100 rounded mb-2" />
        <div className="h-5 w-2/3 bg-slate-100 rounded mb-6" />
        <div className="pt-4 border-t border-slate-50 flex justify-between">
          <div className="h-8 w-24 bg-slate-100 rounded" />
          <div className="h-8 w-16 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        <div className="aspect-square bg-slate-100 rounded-3xl" />
        <div>
          <div className="h-4 w-24 bg-slate-100 rounded mb-4" />
          <div className="h-10 w-full bg-slate-100 rounded mb-4" />
          <div className="h-6 w-1/2 bg-slate-100 rounded mb-8" />
          <div className="h-32 w-full bg-slate-100 rounded-2xl" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 w-full bg-slate-100 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
