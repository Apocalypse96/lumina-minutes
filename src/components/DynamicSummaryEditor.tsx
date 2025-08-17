import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic import with loading fallback
const SummaryEditor = dynamic(() => import("./SummaryEditor"), {
  loading: () => (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-[400px] w-full" />
        <div className="mt-2 space-y-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  ),
  ssr: false, // Disable SSR for this component since it's interactive
});

export default SummaryEditor;
