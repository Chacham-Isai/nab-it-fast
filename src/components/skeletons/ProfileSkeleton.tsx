import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/BottomNav";

const ProfileSkeleton = () => (
  <div className="min-h-screen bg-background pb-24">
    {/* Header */}
    <div className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl border-b border-border/50">
      <div className="flex items-center gap-3 max-w-lg mx-auto px-4 py-3">
        <Skeleton className="w-8 h-8 rounded-xl" />
        <Skeleton className="w-20 h-6 rounded" />
        <Skeleton className="h-5 flex-1 rounded" />
        <Skeleton className="w-8 h-8 rounded-xl" />
      </div>
    </div>

    <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
      {/* Avatar & Name */}
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="w-40 h-6 rounded" />
        <Skeleton className="w-52 h-4 rounded" />
        <Skeleton className="w-32 h-4 rounded" />
        <Skeleton className="w-full h-3 rounded-full max-w-[220px]" />
        <Skeleton className="w-28 h-3 rounded" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      {/* Content Cards */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-28 rounded" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-5 w-20 rounded" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
    <BottomNav />
  </div>
);

export default ProfileSkeleton;
