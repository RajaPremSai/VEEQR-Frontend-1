import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  className = "",
  onClick,
  type = "button",
  ...props
}) => {
  const baseClasses = "btn";
  const variantClasses = `btn--${variant}`;
  const sizeClasses = `btn--${size}`;
  const stateClasses = [
    disabled && "btn--disabled",
    loading && "btn--loading",
    fullWidth && "btn--full-width",
  ]
    .filter(Boolean)
    .join(" ");

  const buttonClasses = [
    baseClasses,
    variantClasses,
    sizeClasses,
    stateClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  const renderIcon = (position) => {
    if (!icon || iconPosition !== position) return null;

    if (typeof icon === "string") {
      return <span className="btn-icon">{icon}</span>;
    }

    return <span className="btn-icon">{icon}</span>;
  };

  const renderSpinner = () => (
    <span className="btn-spinner">
      <svg className="btn-spinner-svg" viewBox="0 0 24 24">
        <circle
          className="btn-spinner-circle"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          strokeWidth="2"
        />
      </svg>
    </span>
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && renderSpinner()}
      {!loading && renderIcon("left")}
      <span className="btn-text">{children}</span>
      {!loading && renderIcon("right")}
    </button>
  );
};

export default Button;
