import React, { useId } from "react";

const FormCheckbox = ({
  label,
  checked,
  onChange,
  error,
  disabled = false,
  className = "",
  ...props
}) => {
  const checkboxId = useId();

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const checkboxClasses = `
    form-checkbox
    ${error ? "form-checkbox--error" : ""}
    ${disabled ? "form-checkbox--disabled" : ""}
    ${className}
  `.trim();

  return (
    <div className="form-field">
      <div className="form-checkbox-container">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className={checkboxClasses}
          {...props}
        />
        <label htmlFor={checkboxId} className="form-checkbox-label">
          <div className="form-checkbox-box">
            <svg
              className="form-checkbox-check"
              width="12"
              height="9"
              viewBox="0 0 12 9"
              fill="none"
            >
              <path
                d="M1 4.5L4.5 8L11 1.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="form-checkbox-text">{label}</span>
        </label>
      </div>
      {error && (
        <div className="form-error" role="alert">
          <span className="form-error-icon">⚠</span>
          <span className="form-error-text">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormCheckbox;
