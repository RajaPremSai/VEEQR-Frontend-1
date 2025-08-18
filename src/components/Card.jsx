import React from "react";

const Card = ({
  children,
  variant = "default",
  padding = "medium",
  shadow = "medium",
  hover = false,
  className = "",
  header,
  footer,
  ...props
}) => {
  const baseClasses = "card";
  const variantClasses = `card--${variant}`;
  const paddingClasses = `card--padding-${padding}`;
  const shadowClasses = `card--shadow-${shadow}`;
  const interactiveClasses = hover ? "card--hover" : "";

  const cardClasses = [
    baseClasses,
    variantClasses,
    paddingClasses,
    shadowClasses,
    interactiveClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses} {...props}>
      {header && <div className="card-header">{header}</div>}
      <div className="card-content">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

// Card Header Component
const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`card-header ${className}`} {...props}>
    {children}
  </div>
);

// Card Content Component
const CardContent = ({ children, className = "", ...props }) => (
  <div className={`card-content ${className}`} {...props}>
    {children}
  </div>
);

// Card Footer Component
const CardFooter = ({ children, className = "", ...props }) => (
  <div className={`card-footer ${className}`} {...props}>
    {children}
  </div>
);

// Card Title Component
const CardTitle = ({ children, className = "", ...props }) => (
  <h3 className={`card-title ${className}`} {...props}>
    {children}
  </h3>
);

// Card Description Component
const CardDescription = ({ children, className = "", ...props }) => (
  <p className={`card-description ${className}`} {...props}>
    {children}
  </p>
);

// Export all components
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.Title = CardTitle;
Card.Description = CardDescription;

export default Card;
