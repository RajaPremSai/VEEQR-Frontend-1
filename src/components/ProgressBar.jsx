export default function ProgressBar({
  progress = 0,
  size = "md",
  color = "primary",
  showLabel = false,
  label = "",
  animated = false,
  striped = false,
  className = "",
}) {
  const sizeClasses = {
    sm: "progress-sm",
    md: "progress-md",
    lg: "progress-lg",
  };

  const colorClasses = {
    primary: "progress-primary",
    success: "progress-success",
    warning: "progress-warning",
    error: "progress-error",
    info: "progress-info",
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`progress-container ${className}`}>
      {(showLabel || label) && (
        <div className="progress-label">
          <span>{label || `${Math.round(clampedProgress)}%`}</span>
        </div>
      )}
      <div className={`progress-bar ${sizeClasses[size]}`}>
        <div
          className={`progress-fill ${colorClasses[color]} ${
            animated ? "progress-animated" : ""
          } ${striped ? "progress-striped" : ""}`}
          style={{ width: `${clampedProgress}%` }}
        >
          {animated && <div className="progress-shine"></div>}
        </div>
      </div>
    </div>
  );
}

// Circular Progress Component
export function CircularProgress({
  progress = 0,
  size = 60,
  strokeWidth = 4,
  color = "primary",
  showLabel = false,
  className = "",
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset =
    circumference - (clampedProgress / 100) * circumference;

  const colorMap = {
    primary: "var(--primary-500)",
    success: "var(--success-500)",
    warning: "var(--warning-500)",
    error: "var(--error-500)",
    info: "var(--info-500)",
  };

  return (
    <div
      className={`circular-progress ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="circular-progress-svg">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--gray-200)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="circular-progress-circle"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {showLabel && (
        <div className="circular-progress-label">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
}
