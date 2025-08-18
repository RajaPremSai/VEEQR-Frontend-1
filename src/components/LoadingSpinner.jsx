export default function LoadingSpinner({
  size = "md",
  color = "primary",
  text = "",
}) {
  const sizeClasses = {
    sm: "spinner-sm",
    md: "spinner-md",
    lg: "spinner-lg",
    xl: "spinner-xl",
  };

  const colorClasses = {
    primary: "spinner-primary",
    success: "spinner-success",
    warning: "spinner-warning",
    error: "spinner-error",
    white: "spinner-white",
  };

  return (
    <div className="spinner-container">
      <div className={`spinner ${sizeClasses[size]} ${colorClasses[color]}`}>
        <div className="spinner-circle"></div>
      </div>
      {text && <div className="spinner-text">{text}</div>}
    </div>
  );
}
