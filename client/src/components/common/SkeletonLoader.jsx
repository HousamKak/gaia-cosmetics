const SkeletonLoader = ({ count = 1, Component }) => {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <Component key={index} />
        ))}
      </>
    );
  };
  
  export { SkeletonLoader };
  