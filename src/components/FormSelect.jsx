import React, { useState, useId } from "react";

const FormSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  error,
  required = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(value ? true : false);
  const selectId = useId();

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(e.target.value.length > 0);
  };

  const handleChange = (e) => {
    setHasValue(e.target.value.length > 0);
    if (onChange) {
      onChange(e);
    }
  };

  const selectClasses = `
    form-select
    ${error ? "form-select--error" : ""}
    ${disabled ? "form-select--disabled" : ""}
    ${className}
  `.trim();

  const labelClasses = `
    form-label
    ${isFocused || hasValue ? "form-label--floating" : ""}
    ${error ? "form-label--error" : ""}
    ${disabled ? "form-label--disabled" : ""}
  `.trim();

  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = error ? errorId : undefined;

  return (
    <div className="form-field">
      <div className="form-select-container">
        <select
          id={selectId}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={selectClasses}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          aria-required={required}
          {...props}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label htmlFor={selectId} className={labelClasses}>
          {label}
          {required && (
            <span className="form-label-required" aria-label="required">
              *
            </span>
          )}
        </label>
        <div className="form-select-arrow" aria-hidden="true">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {error && (
        <div
          id={errorId}
          className="form-error"
          role="alert"
          aria-live="polite"
        >
          <span className="form-error-icon" aria-hidden="true">
            ⚠
          </span>
          <span className="form-error-text">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormSelect;
