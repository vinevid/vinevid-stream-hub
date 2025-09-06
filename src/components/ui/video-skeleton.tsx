import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const VideoSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[3/2] w-full" />
      <CardHeader>
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </CardContent>
    </Card>
  );
};

export const VideoGridSkeleton = ({ count = 12 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <VideoSkeleton key={i} />
      ))}
    </div>
  );
};

export const HeroSkeleton = () => {
  return (
    <section className="relative h-[70vh] overflow-hidden">
      <Skeleton className="absolute inset-0" />
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl space-y-6">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-16 w-full max-w-lg" />
            <Skeleton className="h-20 w-full max-w-xl" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};