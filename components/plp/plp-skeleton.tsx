import { ProductCardSkeleton, Skeleton } from "@/components/ui/skeleton";

/** Loading state for PLP-shaped routes — echoes the sidebar + grid layout. */
export function PlpSkeleton() {
  return (
    <div className="mx-auto max-w-page px-4 pt-5 lg:pt-6">
      <Skeleton className="h-5 w-40 rounded-md" />
      <div className="mt-4 flex items-start gap-5 lg:mt-6">
        <Skeleton className="hidden h-[900px] w-[295px] shrink-0 lg:block" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-44 rounded-md" />
            <Skeleton className="h-5 w-56 rounded-md" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-x-3.5 gap-y-6 lg:mt-7 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-9">
            {Array.from({ length: 9 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
