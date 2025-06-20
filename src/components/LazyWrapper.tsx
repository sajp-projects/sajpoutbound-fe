import { Suspense, ReactNode } from "react";
import LoadingFallback from "./LoadingFallback";

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const LazyWrapper = ({ children, fallback }: LazyWrapperProps) => {
  return (
    <Suspense fallback={fallback || <LoadingFallback />}>{children}</Suspense>
  );
};

export default LazyWrapper;
