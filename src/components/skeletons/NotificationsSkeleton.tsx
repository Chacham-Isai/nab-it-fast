import { Skeleton } from "@/components/ui/skeleton";

const NotificationsSkeleton = () => (
  <div className="space-y-2.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl border border-border/50 bg-card/30">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default NotificationsSkeleton;
