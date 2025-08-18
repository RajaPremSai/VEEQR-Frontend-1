import LoadingSpinner from "./LoadingSpinner";
import SkeletonLoader from "./SkeletonLoader";

// Full page loading overlay
export function PageLoader({ message = "Loading...", backdrop = true }) {
  return (
    <div className={`page-loader ${backdrop ? "page-loader-backdrop" : ""}`}>
      <div className="page-loader-content">
        <LoadingSpinner size="lg" color="primary" text={message} />
      </div>
    </div>
  );
}

// Inline loading state for components
export function InlineLoader({ size = "md", message = "", className = "" }) {
  return (
    <div className={`inline-loader ${className}`}>
      <LoadingSpinner size={size} color="primary" text={message} />
    </div>
  );
}

// Button loading state
export function ButtonLoader({ size = "sm", color = "white" }) {
  return <LoadingSpinner size={size} color={color} />;
}

// Card loading skeleton
export function CardSkeleton({ count = 1, className = "" }) {
  return (
    <div className={`card-skeleton-container ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonLoader key={index} type="card" />
      ))}
    </div>
  );
}

// Table loading skeleton
export function TableSkeleton({ className = "" }) {
  return (
    <div className={`table-skeleton-container ${className}`}>
      <SkeletonLoader type="table" />
    </div>
  );
}

// Text loading skeleton
export function TextSkeleton({ lines = 3, className = "" }) {
  return (
    <div className={`text-skeleton-container ${className}`}>
      <SkeletonLoader type="text" lines={lines} />
    </div>
  );
}

// Loading wrapper that shows skeleton while loading
export function LoadingWrapper({
  isLoading,
  skeleton = "text",
  skeletonProps = {},
  children,
  className = "",
}) {
  if (isLoading) {
    return (
      <div className={`loading-wrapper ${className}`}>
        <SkeletonLoader type={skeleton} {...skeletonProps} />
      </div>
    );
  }

  return children;
}

// Empty state component
export function EmptyState({
  icon = "📭",
  title = "No data found",
  description = "",
  action = null,
  className = "",
}) {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

// Error state component
export function ErrorState({
  icon = "❌",
  title = "Something went wrong",
  description = "Please try again later",
  action = null,
  className = "",
}) {
  return (
    <div className={`error-state ${className}`}>
      <div className="error-state-icon">{icon}</div>
      <h3 className="error-state-title">{title}</h3>
      {description && <p className="error-state-description">{description}</p>}
      {action && <div className="error-state-action">{action}</div>}
    </div>
  );
}
