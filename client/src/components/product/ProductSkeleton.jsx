const ProductSkeleton = () => {
    return (
      <div className="animate-pulse">
        <div className="aspect-w-1 aspect-h-1 bg-neutral-200 rounded-lg mb-3"></div>
        <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
        <div className="mt-2 flex space-x-1">
          <div className="h-4 w-4 bg-neutral-200 rounded-full"></div>
          <div className="h-4 w-4 bg-neutral-200 rounded-full"></div>
          <div className="h-4 w-4 bg-neutral-200 rounded-full"></div>
        </div>
      </div>
    );
  };
  
  export { ProductSkeleton };
  