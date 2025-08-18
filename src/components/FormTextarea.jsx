import React, { useState, useId } from "react";

const FormTextarea = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className = "",
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(value ? true : false);
  const textareaId = useId();

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

  const textareaClasses = `
    form-textarea
    ${error ? "form-textarea--error" : ""}
    ${disabled ? "form-textarea--disabled" : ""}
    ${className}
  `.trim();

  const labelClasses = `
    form-label
    ${isFocused || hasValue ? "form-label--floating" : ""}
    ${error ? "form-label--error" : ""}
    ${disabled ? "form-label--disabled" : ""}
  `.trim();

  const errorId = error ? `${textareaId}-error` : undefined;
  const describedBy = error ? errorId : undefined;

  return (
    <div className="form-field">
      <div className="form-textarea-container">
        <textarea
          id={textareaId}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused ? placeholder : ""}
          disabled={disabled}
          required={required}
          rows={rows}
          className={textareaClasses}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          aria-required={required}
          {...props}
        />
        <label htmlFor={textareaId} className={labelClasses}>
          {label}
          {required && (
            <span className="form-label-required" aria-label="required">
              *
            </span>
          )}
        </label>
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

export default FormTextarea;
