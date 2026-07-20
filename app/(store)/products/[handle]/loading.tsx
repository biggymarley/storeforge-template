import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-page px-4 pt-5 lg:pt-6">
      <Skeleton className="h-5 w-48 rounded-md" />
      <div className="mt-5 grid gap-6 lg:mt-9 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col gap-3.5 lg:flex-row">
          <div className="order-2 flex gap-3.5 lg:order-1 lg:flex-col">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="aspect-[152/167] w-24 lg:w-[152px]" />
            ))}
          </div>
          <Skeleton className="order-1 aspect-[444/530] flex-1 lg:order-2" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-4/5 rounded-md" />
          <Skeleton className="h-6 w-40 rounded-md" />
          <Skeleton className="h-9 w-56 rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="mt-4 h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
