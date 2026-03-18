import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const FeedCardSkeleton = ({ index = 0 }: { index?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.15, ease: "easeOut" }}
    className="rounded-2xl overflow-hidden glass-card gradient-border"
  >
    {/* Seller header */}
    <div className="flex items-center gap-2.5 px-4 py-3">
      <Skeleton className="w-9 h-9 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-2.5 w-32" />
      </div>
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>

    {/* Product image */}
    <Skeleton className="w-full aspect-square rounded-none" />

    {/* Action row & details */}
    <div className="px-4 py-3 space-y-3">
      {/* Social actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-5 rounded" />
          <Skeleton className="w-10 h-5 rounded" />
          <Skeleton className="w-5 h-5 rounded" />
        </div>
        <Skeleton className="w-5 h-5 rounded" />
      </div>

      {/* Title */}
      <Skeleton className="h-5 w-3/4" />
      {/* Reason */}
      <Skeleton className="h-3 w-1/2" />

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>

      {/* AI Match bar */}
      <Skeleton className="h-10 w-full rounded-xl" />

      {/* CTA button */}
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  </motion.div>
);

export default FeedCardSkeleton;
