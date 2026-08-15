import { useState } from "react";
import { cn } from "@/features/tourist/services/utils";
import { Shimmer } from "@/components/common/ui/skeletons";

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    containerClassName?: string;
}

export function ImageWithSkeleton({
    src,
    alt,
    className,
    containerClassName,
    ...props
}: ImageWithSkeletonProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={cn("relative overflow-hidden w-full h-full", containerClassName)}>
            {/* Show shimmer as long as image is not loaded */}
            {!isLoaded && (
                <Shimmer className="absolute inset-0 z-10 w-full h-full rounded-none" />
            )}
            
            <img
                src={src}
                alt={alt}
                className={cn(
                    "w-full h-full object-cover transition-all duration-500",
                    isLoaded ? "opacity-100" : "opacity-0",
                    className
                )}
                onLoad={() => setIsLoaded(true)}
                {...props}
            />
        </div>
    );
}
