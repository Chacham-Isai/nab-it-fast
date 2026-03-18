import { Skeleton } from "@/components/ui/skeleton";

const OrdersSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3.5 p-4 rounded-2xl border border-border/50 bg-card/30">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-5 w-12 rounded" />
      </div>
    ))}
  </div>
);

export default OrdersSkeleton;
